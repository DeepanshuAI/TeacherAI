"""
LangGraph node implementations for the TeacherAI Agent.

Architecture Workflow:
1. `node_reason`: Pre-response internal reasoning (analyzes student profile, level, misconceptions, and suggested tools).
2. `node_execute_tools`: Executes modular internal tools (ProfileUpdater, KnowledgeEstimator, QuizGenerator, etc.).
3. `node_generate_response`: Generates the adaptive Socratic response using LLM.
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
    INTENT_ANALYZER_PROMPT,
    STUDENT_ANALYZER_PROMPT,
    TEACHING_PLANNER_PROMPT,
    LEARNING_EVALUATOR_PROMPT,
    INTERNAL_REASONING_PROMPT,
    ONBOARDING_INITIAL_PROMPT,
    TEACHER_AGENT_SYSTEM_PROMPT,
)
from app.agent.state import TeacherState
from app.agent.tools import (
    execute_homework_generator,
    execute_knowledge_estimator,
    execute_profile_updater,
    execute_quiz_generator,
)
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
            streaming=True,
        )
    elif provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            model="claude-3-5-sonnet-20241022",
            temperature=temperature,
            api_key=getattr(settings, "ANTHROPIC_API_KEY", ""),
        )
    else:
        return ChatOpenAI(
            model=getattr(settings, "OPENAI_MODEL", "gpt-4o"),
            temperature=temperature,
            api_key=getattr(settings, "OPENAI_API_KEY", ""),
            streaming=True,
        )


def _get_json_llm() -> Any:
    """LLM instance for JSON reasoning."""
    provider = getattr(settings, "LLM_PROVIDER", "gemini").lower()
    
    if provider == "gemini":
        if not ChatGoogleGenerativeAI:
            raise RuntimeError("langchain-google-genai is not installed.")
        model_name = getattr(settings, "GEMINI_MODEL", "gemini-3.6-flash") or "gemini-3.6-flash"
        api_key = getattr(settings, "GEMINI_API_KEY", "") or getattr(settings, "GOOGLE_API_KEY", "")
        return ChatGoogleGenerativeAI(
            model=model_name,
            temperature=0.2,
            google_api_key=api_key,
            model_kwargs={"response_mime_type": "application/json"},
        )
    else:
        return ChatOpenAI(
            model=getattr(settings, "OPENAI_MODEL", "gpt-4o"),
            temperature=0.2,
            api_key=getattr(settings, "OPENAI_API_KEY", ""),
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


async def node_analyze_intent(state: TeacherState) -> dict[str, Any]:
    """Module 1: Intent Analyzer — Classifies student query category and topic."""
    logger.info("Entering node_analyze_intent")
    messages = state.get("messages") or []
    if not messages:
        return {"intent": {"category": "casual_conversation", "topic": None, "summary": "Initial onboarding greeting"}}

    latest_msg = ""
    for m in reversed(messages):
        if isinstance(m, HumanMessage):
            latest_msg = m.content
            break

    llm = _get_json_llm()
    prompt = INTENT_ANALYZER_PROMPT.format(latest_user_message=latest_msg)
    try:
        res = await llm.ainvoke([SystemMessage(content="Classify student intent as JSON."), HumanMessage(content=prompt)])
        data = json.loads(_extract_text(res.content))
        return {"intent": data}
    except Exception as e:
        logger.warning("Intent analyzer fallback", error=str(e))
        return {"intent": {"category": "explanation", "topic": state.get("topic"), "summary": latest_msg}}


async def node_analyze_student(state: TeacherState) -> dict[str, Any]:
    """Module 2: Student Analyzer — Assesses student profile, current class, mastery, and confidence."""
    logger.info("Entering node_analyze_student")
    profile = state.get("student_profile") or {}
    messages = state.get("messages") or []
    recent_history = "\n".join([f"{'Student' if isinstance(m, HumanMessage) else 'Teacher'}: {m.content}" for m in messages[-6:]])

    llm = _get_json_llm()
    prompt = STUDENT_ANALYZER_PROMPT.format(student_profile_json=json.dumps(profile), recent_history=recent_history)
    try:
        res = await llm.ainvoke([SystemMessage(content="Analyze student state as JSON."), HumanMessage(content=prompt)])
        data = json.loads(_extract_text(res.content))
        return {"student_analysis": data}
    except Exception as e:
        logger.warning("Student analyzer fallback", error=str(e))
        return {"student_analysis": {"estimated_mastery": "beginner", "confidence_level": profile.get("confidenceLevel", "building")}}


async def node_plan_teaching(state: TeacherState) -> dict[str, Any]:
    """Module 3: Teaching Planner — Formulates explicit teaching strategy before generating response."""
    logger.info("Entering node_plan_teaching")
    intent = state.get("intent") or {}
    student_analysis = state.get("student_analysis") or {}
    profile = state.get("student_profile") or {}
    messages = state.get("messages") or []

    latest_msg = ""
    for m in reversed(messages):
        if isinstance(m, HumanMessage):
            latest_msg = m.content
            break
    recent_history = "\n".join([f"{'Student' if isinstance(m, HumanMessage) else 'Teacher'}: {m.content}" for m in messages[-6:]])

    llm = _get_json_llm()
    prompt = TEACHING_PLANNER_PROMPT.format(
        intent_json=json.dumps(intent),
        student_analysis_json=json.dumps(student_analysis),
        student_profile_json=json.dumps(profile),
        recent_history=recent_history,
        latest_user_message=latest_msg
    )
    try:
        res = await llm.ainvoke([SystemMessage(content="Formulate teaching strategy as JSON."), HumanMessage(content=prompt)])
        data = json.loads(_extract_text(res.content))
        strategy_str = f"Strategy: {data.get('strategy_name', 'Socratic Adaptation')}. Tactics: {', '.join(data.get('tactics', []))}. Tone: {data.get('tone', 'encouraging')}"
        return {"teaching_strategy": strategy_str, "internal_reasoning": strategy_str}
    except Exception as e:
        logger.warning("Teaching planner fallback", error=str(e))
        return {"teaching_strategy": "Adapt response to student level with clear explanations and 1 follow-up question."}


async def node_evaluate_learning(state: TeacherState) -> dict[str, Any]:
    """Module 5: Learning Evaluator — Evaluates student understanding post-generation."""
    logger.info("Entering node_evaluate_learning")
    messages = state.get("messages") or []
    last_teacher_msg = state.get("last_teacher_message", "")
    latest_msg = ""
    for m in reversed(messages):
        if isinstance(m, HumanMessage):
            latest_msg = m.content
            break

    llm = _get_json_llm()
    prompt = LEARNING_EVALUATOR_PROMPT.format(
        latest_user_message=latest_msg,
        teacher_response=last_teacher_msg,
        topic=state.get("topic") or "General"
    )
    try:
        res = await llm.ainvoke([SystemMessage(content="Evaluate student understanding as JSON."), HumanMessage(content=prompt)])
        data = json.loads(_extract_text(res.content))
        return {"learning_evaluation": data}
    except Exception as e:
        logger.warning("Learning evaluator fallback", error=str(e))
        return {"learning_evaluation": {"demonstrated_understanding": "unassessed"}}


async def node_update_profile(state: TeacherState) -> dict[str, Any]:
    """Module 6: Student Profile Updater — Updates student profile metrics automatically without asking."""
    logger.info("Entering node_update_profile")
    profile = state.get("student_profile") or {}
    eval_data = state.get("learning_evaluation") or {}
    student_analysis = state.get("student_analysis") or {}

    updates = {}
    if student_analysis.get("detected_profile_updates"):
        updates.update(student_analysis["detected_profile_updates"])

    if eval_data.get("new_weak_topics"):
        weak = set(profile.get("weakTopics", []))
        weak.update(eval_data["new_weak_topics"])
        updates["weakTopics"] = list(weak)

    if eval_data.get("new_strong_topics"):
        strong = set(profile.get("strongTopics", []))
        strong.update(eval_data["new_strong_topics"])
        updates["strongTopics"] = list(strong)

    if eval_data.get("recent_mistakes"):
        mistakes = profile.get("recentMistakes", [])
        mistakes.extend(eval_data["recent_mistakes"])
        updates["recentMistakes"] = mistakes[-10:]

    if updates:
        profile = await execute_profile_updater(profile, updates)
        return {"student_profile": profile}

    return {}


async def node_reason(state: TeacherState) -> dict[str, Any]:
    """Backward-compatible reason node wrapper."""
    return await node_plan_teaching(state)


async def node_execute_tools(state: TeacherState) -> dict[str, Any]:
    """
    Step 2: Tool Execution Node.
    Executes background tool operations (ProfileUpdater, KnowledgeEstimator, QuizGenerator, etc.).
    """
    tool = state.get("suggested_tool") or "chat"
    profile = state.get("student_profile") or {}
    tool_output = state.get("tool_output") or {}
    messages = state.get("messages") or []
    
    latest_user_msg = ""
    for m in reversed(messages):
        if isinstance(m, HumanMessage):
            latest_user_msg = m.content
            break

    state_update: dict[str, Any] = {}
    
    # 1. Always apply detected profile updates if present
    detected_updates = tool_output.get("detected_updates", {})
    if detected_updates:
        profile = await execute_profile_updater(profile, detected_updates)
        state_update["student_profile"] = profile

    # 2. Run specific tool
    if tool == "quiz_generator":
        topic = state.get("topic") or "General Learning"
        quiz = await execute_quiz_generator(profile, topic)
        state_update["active_quiz"] = quiz
        state_update["message_type"] = "quiz"
    elif tool == "knowledge_estimator":
        topic = state.get("topic") or "General Learning"
        ke_res = await execute_knowledge_estimator(profile, topic, latest_user_msg)
        profile.update(ke_res)
        state_update["student_profile"] = profile
    elif tool == "homework_generator":
        topic = state.get("topic") or "General Learning"
        hw = await execute_homework_generator(profile, topic)
        state_update["tool_output"] = {"homework": hw}
        state_update["message_type"] = "homework"

    return state_update


async def node_generate_response(state: TeacherState) -> dict[str, Any]:
    """
    Module 4: Prompt Builder & Response Generation Node.
    Generates the final adaptive Socratic message to send to the student using Intent, Student Analysis, & Teaching Strategy.
    """
    logger.info("Entering node_generate_response")
    llm = _get_llm(temperature=0.7)
    
    profile = state.get("student_profile") or {}
    messages = state.get("messages") or []
    intent = state.get("intent") or {}
    student_analysis = state.get("student_analysis") or {}
    strategy = state.get("teaching_strategy") or state.get("internal_reasoning") or "Adapt to student level."
    active_quiz = state.get("active_quiz")

    # If this is onboarding initial start:
    if not messages:
        response = await llm.ainvoke([SystemMessage(content=ONBOARDING_INITIAL_PROMPT)])
        msg_text = _extract_text(response.content)
        return {
            "messages": [AIMessage(content=msg_text)],
            "last_teacher_message": msg_text,
            "message_type": "onboarding"
        }

    # Module 4: Prompt Builder assembling Context + Strategy
    system_prompt = TEACHER_AGENT_SYSTEM_PROMPT.format(
        student_profile_json=json.dumps(profile, indent=2)
    )

    llm_messages = [
        SystemMessage(content=system_prompt),
        SystemMessage(content=f"[ANALYZED INTENT]: {json.dumps(intent)}"),
        SystemMessage(content=f"[STUDENT ANALYSIS]: {json.dumps(student_analysis)}"),
        SystemMessage(content=f"[TEACHING STRATEGY TO EXECUTE]: {strategy}")
    ]

    # Append recent conversation history
    for m in messages[-10:]:
        llm_messages.append(m)

    # If active quiz was generated in tool step, append instruction
    if active_quiz and state.get("message_type") == "quiz":
        llm_messages.append(SystemMessage(content=f"Administer this quiz formatted beautifully: {json.dumps(active_quiz)}"))

    response = await llm.ainvoke(llm_messages)
    teacher_message = _extract_text(response.content)

    return {
        "messages": [AIMessage(content=teacher_message)],
        "last_teacher_message": teacher_message,
        "message_type": state.get("message_type", "text")
    }
