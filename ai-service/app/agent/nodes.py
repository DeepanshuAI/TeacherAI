"""
LangGraph node implementations for the TeacherAI agent.

Each node:
1. Receives the current TeacherState
2. Performs one specific teaching action
3. Returns a state update dict
"""

import json
from typing import Any

import structlog
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
try:
    from langchain_google_genai import ChatGoogleGenerativeAI
except ImportError:
    ChatGoogleGenerativeAI = None  # type: ignore

from app.agent.prompts import (
    ASSIGN_HOMEWORK_PROMPT,
    CLARIFY_PROMPT,
    EVALUATE_PROMPT,
    EXAMPLE_PROMPT,
    EXPLAIN_MISTAKE_PROMPT,
    EXPLAIN_PROMPT,
    IDENTIFY_LEVEL_PROMPT,
    PLAN_LESSON_PROMPT,
    PRACTICE_PROMPT,
    QUIZ_PROMPT,
    SUMMARIZE_PROMPT,
    TEACHER_SYSTEM_PROMPT,
    UPDATE_MEMORY_PROMPT,
)
from app.agent.state import LessonPhase, StudentLevel, TeacherState
from app.core.config import settings

logger = structlog.get_logger(__name__)


def _get_llm(temperature: float = 0.7) -> Any:
    """Get configured LLM instance based on LLM_PROVIDER setting."""
    provider = getattr(settings, "LLM_PROVIDER", "gemini").lower()
    
    if provider == "gemini":
        if not ChatGoogleGenerativeAI:
            raise RuntimeError("langchain-google-genai is not installed.")
        model_name = getattr(settings, "GEMINI_MODEL", "gemini-3.6-flash") or "gemini-3.6-flash"
        api_key = getattr(settings, "GEMINI_API_KEY", "") or getattr(settings, "GOOGLE_API_KEY", "")
        return ChatGoogleGenerativeAI(
            model=model_name,
            temperature=temperature,
            google_api_key=api_key,
        )
    elif provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            model="claude-3-5-sonnet-20241022",
            temperature=temperature,
            api_key=settings.ANTHROPIC_API_KEY,
        )
    else:
        return ChatOpenAI(
            model=settings.OPENAI_MODEL,
            temperature=temperature,
            api_key=settings.OPENAI_API_KEY,
            streaming=True,
        )


def _get_json_llm() -> Any:
    """LLM instance for structured JSON output."""
    provider = getattr(settings, "LLM_PROVIDER", "gemini").lower()
    
    if provider == "gemini":
        if not ChatGoogleGenerativeAI:
            raise RuntimeError("langchain-google-genai is not installed.")
        model_name = getattr(settings, "GEMINI_MODEL", "gemini-3.6-flash") or "gemini-3.6-flash"
        api_key = getattr(settings, "GEMINI_API_KEY", "") or getattr(settings, "GOOGLE_API_KEY", "")
        return ChatGoogleGenerativeAI(
            model=model_name,
            temperature=0.3,
            google_api_key=api_key,
        )
    else:
        return ChatOpenAI(
            model=settings.OPENAI_MODEL,
            temperature=0.3,
            api_key=settings.OPENAI_API_KEY,
            response_format={"type": "json_object"},
        )


def _extract_text(content: Any) -> str:
    """Safely extract string text from response.content regardless of provider format."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, str):
                parts.append(item)
            elif isinstance(item, dict) and item.get("type") == "text":
                parts.append(item.get("text", ""))
        return "".join(parts)
    return str(content)


def _format_messages_for_llm(messages: list) -> list:
    """Ensure message history for LLM does not end with an AIMessage (required by Gemini)."""
    cleaned = list(messages)
    # Ensure system messages stay at front, but system + user/ai list doesn't end in AIMessage
    # Find last index that is HumanMessage or SystemMessage
    while len(cleaned) > 1 and isinstance(cleaned[-1], AIMessage):
        cleaned.pop()
    return cleaned


async def node_identify_level(state: TeacherState) -> dict[str, Any]:
    """
    Assess the student's current knowledge level about the topic.
    Asks a diagnostic question to understand their starting point.
    """
    logger.info("Entering identify_level node", topic=state["topic"])
    llm = _get_llm(temperature=0.6)

    # Check if we already have enough info from messages
    messages_count = len(state["messages"])

    if messages_count >= 3 and state["student_level"] != StudentLevel.UNKNOWN:
        # Already identified — move to planning
        return {"current_phase": LessonPhase.PLAN, "needs_clarification": False}

    prompt = IDENTIFY_LEVEL_PROMPT.format(topic=state["topic"])
    messages = [
        SystemMessage(content=TEACHER_SYSTEM_PROMPT),
        SystemMessage(content=prompt),
        *state["messages"],
    ]

    response = await llm.ainvoke(_format_messages_for_llm(messages))
    teacher_message = _extract_text(response.content)

    # Try to infer level from conversation
    inferred_level = _infer_level_from_conversation(state["messages"], state["topic"])
    needs_more_info = messages_count < 3 or inferred_level == StudentLevel.UNKNOWN

    return {
        "messages": [AIMessage(content=teacher_message)],
        "last_teacher_message": teacher_message,
        "message_type": "text",
        "student_level": inferred_level if not needs_more_info else StudentLevel.UNKNOWN,
        "current_phase": LessonPhase.IDENTIFY,
        "needs_clarification": needs_more_info,
    }


async def node_clarify(state: TeacherState) -> dict[str, Any]:
    """Ask a clarifying question about the student's specific needs."""
    logger.info("Entering clarify node")
    llm = _get_llm(temperature=0.6)

    prompt = CLARIFY_PROMPT.format(topic=state["topic"])
    messages = [
        SystemMessage(content=TEACHER_SYSTEM_PROMPT),
        SystemMessage(content=prompt),
        *state["messages"],
    ]

    response = await llm.ainvoke(messages)
    teacher_message = _extract_text(response.content)

    return {
        "messages": [AIMessage(content=teacher_message)],
        "last_teacher_message": teacher_message,
        "message_type": "text",
        "current_phase": LessonPhase.CLARIFY,
        "needs_clarification": False,
    }


async def node_plan_lesson(state: TeacherState) -> dict[str, Any]:
    """Create a structured lesson plan for the student."""
    logger.info("Entering plan_lesson node", level=state["student_level"])
    llm = _get_llm(temperature=0.5)

    # Extract student's stated goal from conversation
    goal = _extract_goal_from_messages(state["messages"])

    prompt = PLAN_LESSON_PROMPT.format(
        topic=state["topic"],
        level=state["student_level"],
        weak_topics=", ".join(state["weak_topics"]) or "none identified yet",
        strong_topics=", ".join(state["strong_topics"]) or "none identified yet",
        goal=goal,
    )

    messages = [
        SystemMessage(content=TEACHER_SYSTEM_PROMPT),
        SystemMessage(content=prompt),
        *state["messages"],
    ]

    response = await llm.ainvoke(messages)
    teacher_message = _extract_text(response.content)

    # Parse lesson plan from response
    lesson_plan = _parse_lesson_plan(teacher_message, state["topic"])

    return {
        "messages": [AIMessage(content=teacher_message)],
        "last_teacher_message": teacher_message,
        "message_type": "text",
        "current_phase": LessonPhase.EXPLAIN,
        "lesson_plan": lesson_plan,
        "current_subtopic_index": 0,
    }


async def node_explain(state: TeacherState) -> dict[str, Any]:
    """Explain the current subtopic in a clear, concise way."""
    logger.info("Entering explain node")
    llm = _get_llm(temperature=0.7)

    lesson_plan = state.get("lesson_plan") or [state["topic"]]
    idx = state.get("current_subtopic_index", 0)
    current_subtopic = lesson_plan[idx] if idx < len(lesson_plan) else state["topic"]

    prompt = EXPLAIN_PROMPT.format(
        current_subtopic=current_subtopic,
        level=state["student_level"],
        topic=state["topic"],
    )

    messages = [
        SystemMessage(content=TEACHER_SYSTEM_PROMPT),
        SystemMessage(content=prompt),
        *state["messages"][-10:],  # Keep last 10 messages for context
    ]

    response = await llm.ainvoke(messages)
    teacher_message = _extract_text(response.content)

    return {
        "messages": [AIMessage(content=teacher_message)],
        "last_teacher_message": teacher_message,
        "message_type": "text",
        "current_phase": LessonPhase.EXAMPLE,
        "examples_given": state.get("examples_given", 0),
    }


async def node_example(state: TeacherState) -> dict[str, Any]:
    """Provide a concrete example for the current concept."""
    logger.info("Entering example node")
    llm = _get_llm(temperature=0.8)

    lesson_plan = state.get("lesson_plan") or [state["topic"]]
    idx = state.get("current_subtopic_index", 0)
    current_subtopic = lesson_plan[idx] if idx < len(lesson_plan) else state["topic"]

    prompt = EXAMPLE_PROMPT.format(
        current_subtopic=current_subtopic,
        level=state["student_level"],
        concept=current_subtopic,
    )

    messages = [
        SystemMessage(content=TEACHER_SYSTEM_PROMPT),
        SystemMessage(content=prompt),
        *state["messages"][-6:],
    ]

    response = await llm.ainvoke(messages)
    teacher_message = _extract_text(response.content)

    return {
        "messages": [AIMessage(content=teacher_message)],
        "last_teacher_message": teacher_message,
        "message_type": "text",
        "current_phase": LessonPhase.PRACTICE,
        "examples_given": state.get("examples_given", 0) + 1,
    }


async def node_practice(state: TeacherState) -> dict[str, Any]:
    """Pose a practice question to the student."""
    logger.info("Entering practice node")
    llm = _get_llm(temperature=0.6)

    lesson_plan = state.get("lesson_plan") or [state["topic"]]
    idx = state.get("current_subtopic_index", 0)
    current_subtopic = lesson_plan[idx] if idx < len(lesson_plan) else state["topic"]

    prompt = PRACTICE_PROMPT.format(
        current_subtopic=current_subtopic,
        level=state["student_level"],
        difficulty=state.get("current_difficulty", "easy"),
    )

    messages = [
        SystemMessage(content=TEACHER_SYSTEM_PROMPT),
        SystemMessage(content=prompt),
        *state["messages"][-6:],
    ]

    response = await llm.ainvoke(messages)
    teacher_message = _extract_text(response.content)

    return {
        "messages": [AIMessage(content=teacher_message)],
        "last_teacher_message": teacher_message,
        "message_type": "text",
        "current_phase": LessonPhase.EVALUATE,
        "questions_asked": state.get("questions_asked", 0) + 1,
    }


async def node_evaluate(state: TeacherState) -> dict[str, Any]:
    """Evaluate the student's answer and provide feedback."""
    logger.info("Entering evaluate node")
    llm = _get_llm(temperature=0.5)

    lesson_plan = state.get("lesson_plan") or [state["topic"]]
    idx = state.get("current_subtopic_index", 0)
    current_subtopic = lesson_plan[idx] if idx < len(lesson_plan) else state["topic"]

    # Get the last student message
    last_student_message = ""
    for msg in reversed(state["messages"]):
        if isinstance(msg, HumanMessage):
            last_student_message = msg.content
            break

    prompt = EVALUATE_PROMPT.format(
        student_answer=last_student_message,
        correct_concepts=current_subtopic,
        level=state["student_level"],
        mistakes=", ".join(state.get("mistakes_this_session", [])) or "none",
    )

    messages = [
        SystemMessage(content=TEACHER_SYSTEM_PROMPT),
        SystemMessage(content=prompt),
        *state["messages"][-8:],
    ]

    response = await llm.ainvoke(messages)
    teacher_message = _extract_text(response.content)

    # Determine if answer was correct based on response sentiment
    is_correct = _assess_correctness(teacher_message)

    correct_count = state.get("correct_answers", 0)
    incorrect_count = state.get("incorrect_answers", 0)
    mistakes = list(state.get("mistakes_this_session", []))

    if is_correct:
        correct_count += 1
        next_phase = LessonPhase.EXPLAIN  # Move to next subtopic or increase difficulty
    else:
        incorrect_count += 1
        mistakes.append(current_subtopic)
        next_phase = LessonPhase.EVALUATE  # Stay in evaluate, show mistake explanation

    # Advance to next subtopic if student answered correctly
    next_idx = idx
    if is_correct and idx + 1 < len(lesson_plan):
        next_idx = idx + 1
    elif is_correct and idx + 1 >= len(lesson_plan):
        next_phase = LessonPhase.QUIZ

    return {
        "messages": [AIMessage(content=teacher_message)],
        "last_teacher_message": teacher_message,
        "message_type": "text",
        "current_phase": next_phase,
        "correct_answers": correct_count,
        "incorrect_answers": incorrect_count,
        "mistakes_this_session": mistakes,
        "current_subtopic_index": next_idx,
    }


async def node_explain_mistake(state: TeacherState) -> dict[str, Any]:
    """Explain a mistake in a different way to help the student understand."""
    logger.info("Entering explain_mistake node")
    llm = _get_llm(temperature=0.7)

    lesson_plan = state.get("lesson_plan") or [state["topic"]]
    idx = state.get("current_subtopic_index", 0)
    current_subtopic = lesson_plan[idx] if idx < len(lesson_plan) else state["topic"]

    last_student_message = ""
    for msg in reversed(state["messages"]):
        if isinstance(msg, HumanMessage):
            last_student_message = msg.content
            break

    prompt = EXPLAIN_MISTAKE_PROMPT.format(
        mistake_topic=current_subtopic,
        student_answer=last_student_message,
        correct_concept=current_subtopic,
    )

    messages = [
        SystemMessage(content=TEACHER_SYSTEM_PROMPT),
        SystemMessage(content=prompt),
        *state["messages"][-8:],
    ]

    response = await llm.ainvoke(messages)
    teacher_message = _extract_text(response.content)

    return {
        "messages": [AIMessage(content=teacher_message)],
        "last_teacher_message": teacher_message,
        "message_type": "text",
        "current_phase": LessonPhase.PRACTICE,
    }


async def node_quiz(state: TeacherState) -> dict[str, Any]:
    """Generate and administer a quiz on the completed lesson."""
    logger.info("Entering quiz node")
    llm = _get_json_llm()

    # Determine question type and difficulty based on student performance
    correct = state.get("correct_answers", 0)
    total = state.get("questions_asked", 1)
    score = (correct / total) * 100 if total > 0 else 50

    if score >= 80:
        difficulty = "hard"
        question_type = "short_answer"
    elif score >= 60:
        difficulty = "medium"
        question_type = "mcq"
    else:
        difficulty = "easy"
        question_type = "true_false"

    prompt = QUIZ_PROMPT.format(
        topic=state["topic"],
        difficulty=difficulty,
        question_type=question_type,
    )

    response = await llm.ainvoke([
        SystemMessage(content="Generate a quiz question and return valid JSON only."),
        HumanMessage(content=prompt),
    ])

    quiz_data = {}
    try:
        quiz_data = json.loads(_extract_text(response.content))
    except json.JSONDecodeError:
        logger.error("Failed to parse quiz JSON", response=_extract_text(response.content))
        quiz_data = {
            "type": "short_answer",
            "question": f"In your own words, explain what you learned about {state['topic']} today.",
            "correct_answer": "Open-ended reflection",
            "explanation": "This helps solidify understanding through reflection.",
            "difficulty": "easy",
            "topic": state["topic"],
        }

    # Format quiz for display
    quiz_message = _format_quiz_message(quiz_data)

    return {
        "messages": [AIMessage(content=quiz_message)],
        "last_teacher_message": quiz_message,
        "message_type": "quiz",
        "active_quiz": quiz_data,
        "current_phase": LessonPhase.QUIZ,
        "current_difficulty": difficulty,
    }


async def node_summarize(state: TeacherState) -> dict[str, Any]:
    """Summarize the lesson and the student's performance."""
    logger.info("Entering summarize node")
    llm = _get_llm(temperature=0.6)

    correct = state.get("correct_answers", 0)
    total = state.get("questions_asked", 1)
    lesson_plan = state.get("lesson_plan") or [state["topic"]]

    # Identify strong and weak areas from this session
    mistakes = state.get("mistakes_this_session", [])
    covered_topics = lesson_plan[: state.get("current_subtopic_index", 0) + 1]
    strong_areas = [t for t in covered_topics if t not in mistakes]

    prompt = SUMMARIZE_PROMPT.format(
        topic=state["topic"],
        subtopics_covered=", ".join(covered_topics),
        correct_answers=correct,
        total_questions=total,
        strong_areas=", ".join(strong_areas) or "all topics",
        weak_areas=", ".join(mistakes) or "none",
    )

    messages = [
        SystemMessage(content=TEACHER_SYSTEM_PROMPT),
        SystemMessage(content=prompt),
    ]

    response = await llm.ainvoke(messages)
    teacher_message = _extract_text(response.content)

    return {
        "messages": [AIMessage(content=teacher_message)],
        "last_teacher_message": teacher_message,
        "message_type": "summary",
        "current_phase": LessonPhase.HOMEWORK,
    }


async def node_assign_homework(state: TeacherState) -> dict[str, Any]:
    """Create personalized homework based on the lesson."""
    logger.info("Entering assign_homework node")
    llm = _get_llm(temperature=0.7)

    mistakes = state.get("mistakes_this_session", [])

    prompt = ASSIGN_HOMEWORK_PROMPT.format(
        topic=state["topic"],
        level=state["student_level"],
        weak_areas=", ".join(mistakes) or "none identified",
    )

    messages = [
        SystemMessage(content=TEACHER_SYSTEM_PROMPT),
        SystemMessage(content=prompt),
    ]

    response = await llm.ainvoke(messages)
    teacher_message = _extract_text(response.content)

    return {
        "messages": [AIMessage(content=teacher_message)],
        "last_teacher_message": teacher_message,
        "message_type": "homework",
        "current_phase": LessonPhase.COMPLETE,
        "lesson_complete": True,
    }


async def node_update_memory(state: TeacherState) -> dict[str, Any]:
    """Update the student's learning profile based on session performance."""
    logger.info("Entering update_memory node")
    llm = _get_json_llm()

    correct = state.get("correct_answers", 0)
    total = state.get("questions_asked", 1)
    score = (correct / total) * 100 if total > 0 else 50

    prompt = UPDATE_MEMORY_PROMPT.format(
        topic=state["topic"],
        performance_summary=f"Score: {score:.0f}% ({correct}/{total} correct)",
        weak_topics=", ".join(state.get("weak_topics", [])),
        strong_topics=", ".join(state.get("strong_topics", [])),
    )

    response = await llm.ainvoke([
        SystemMessage(content="Update student profile and return valid JSON only."),
        HumanMessage(content=prompt),
    ])

    memory_update = {}
    try:
        memory_update = json.loads(_extract_text(response.content))
    except json.JSONDecodeError:
        logger.error("Failed to parse memory update JSON")
        memory_update = {
            "add_to_strong": [],
            "add_to_weak": [],
            "learning_speed_this_session": "average",
            "notes": "",
        }

    # Merge with existing topics
    strong_topics = list(set(state.get("strong_topics", []) + memory_update.get("add_to_strong", [])))
    weak_topics = list(set(state.get("weak_topics", []) + memory_update.get("add_to_weak", [])))
    # Remove from weak if now in strong
    weak_topics = [t for t in weak_topics if t not in strong_topics]

    return {
        "strong_topics": strong_topics,
        "weak_topics": weak_topics,
        "learning_speed": memory_update.get("learning_speed_this_session", "average"),
        "quiz_results": state.get("quiz_results", []) + [
            {
                "topic": state["topic"],
                "score": score,
                "correct": correct,
                "total": total,
                "notes": memory_update.get("notes", ""),
            }
        ],
    }


# ─── Helper functions ────────────────────────────────────────────────────────

def _infer_level_from_conversation(messages: list, topic: str) -> str:
    """Heuristically infer student level from their messages."""
    if not messages:
        return StudentLevel.UNKNOWN

    # Look at last few human messages
    human_texts = [
        m.content.lower()
        for m in messages
        if isinstance(m, HumanMessage)
    ]

    if not human_texts:
        return StudentLevel.UNKNOWN

    combined = " ".join(human_texts)

    # Beginner indicators
    beginner_signals = ["never", "don't know", "no idea", "what is", "new to", "beginner", "just started"]
    # Advanced indicators
    advanced_signals = ["already know", "familiar with", "experienced", "working on", "production", "optimize"]

    beginner_score = sum(1 for s in beginner_signals if s in combined)
    advanced_score = sum(1 for s in advanced_signals if s in combined)

    if advanced_score > beginner_score:
        return StudentLevel.ADVANCED
    elif beginner_score > 0 or len(human_texts) <= 1:
        return StudentLevel.BEGINNER
    else:
        return StudentLevel.INTERMEDIATE


def _extract_goal_from_messages(messages: list) -> str:
    """Extract the student's stated learning goal from messages."""
    for msg in reversed(messages):
        if isinstance(msg, HumanMessage) and len(msg.content) > 10:
            return msg.content[:200]
    return "General understanding"


def _parse_lesson_plan(response_text: str, topic: str) -> list[str]:
    """Parse numbered list from lesson plan response."""
    lines = response_text.strip().split("\n")
    plan = []
    for line in lines:
        line = line.strip()
        if line and (line[0].isdigit() or line.startswith("-")):
            # Strip numbering and bullets
            clean = line.lstrip("0123456789.-) ").strip()
            if clean and len(clean) > 2:
                plan.append(clean)
    return plan if plan else [topic]


def _assess_correctness(teacher_response: str) -> bool:
    """Determine if the teacher's evaluation indicates a correct answer."""
    response_lower = teacher_response.lower()
    correct_signals = [
        "correct", "exactly", "well done", "that's right", "perfect",
        "you got it", "spot on", "great job", "moving forward", "excellent"
    ]
    incorrect_signals = [
        "not quite", "close but", "not exactly", "hint", "try again",
        "let me", "think about", "almost", "missing"
    ]

    correct_score = sum(1 for s in correct_signals if s in response_lower)
    incorrect_score = sum(1 for s in incorrect_signals if s in response_lower)

    return correct_score > incorrect_score


def _format_quiz_message(quiz_data: dict) -> str:
    """Format quiz data into a readable message."""
    q_type = quiz_data.get("type", "short_answer")
    question = quiz_data.get("question", "")
    options = quiz_data.get("options", [])

    msg = f"**Quiz Time!** ({quiz_data.get('difficulty', 'medium').title()} — {quiz_data.get('topic', '')})\n\n"
    msg += f"{question}\n"

    if q_type == "mcq" and options:
        msg += "\n"
        for opt in options:
            msg += f"  {opt}\n"

    msg += "\nTake your time and type your answer below."
    return msg
