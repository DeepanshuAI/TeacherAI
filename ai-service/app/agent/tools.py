"""
Modular internal tools for the TeacherAI Agent.

Each tool performs a specific background operation to enrich the student's profile,
estimate knowledge, generate quizzes, or retrieve memory.
"""

import json
from typing import Any
import structlog
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

try:
    from langchain_google_genai import ChatGoogleGenerativeAI
except ImportError:
    ChatGoogleGenerativeAI = None  # type: ignore

from app.agent.prompts import HOMEWORK_GENERATOR_PROMPT, QUIZ_GENERATOR_PROMPT
from app.core.config import settings

logger = structlog.get_logger(__name__)


def _get_json_llm() -> Any:
    """Get LLM configured for JSON output."""
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
            model=getattr(settings, "OPENAI_MODEL", "gpt-4o"),
            temperature=0.3,
            api_key=getattr(settings, "OPENAI_API_KEY", ""),
            response_format={"type": "json_object"},
        )


async def execute_profile_updater(current_profile: dict, updates: dict) -> dict:
    """
    Tool: ProfileUpdater
    Merges newly extracted profile insights (name, gradeClass, board, subjects, strongTopics, weakTopics, etc.)
    into the student's persistent profile.
    """
    logger.info("Executing ProfileUpdaterTool", updates=updates)
    updated = dict(current_profile)
    
    for key, value in updates.items():
        if not value:
            continue
        if isinstance(value, list) and key in updated and isinstance(updated[key], list):
            # Unique merge for list fields
            combined = set(updated[key] + value)
            updated[key] = list(combined)
        else:
            updated[key] = value

    return updated


async def execute_knowledge_estimator(current_profile: dict, topic: str, user_interaction: str) -> dict:
    """
    Tool: KnowledgeEstimator
    Estimates topic mastery (0-100 score) independently of the student's grade level.
    """
    logger.info("Executing KnowledgeEstimatorTool", topic=topic)
    llm = _get_json_llm()
    
    prompt = f"""Estimate student mastery for topic: "{topic}" based on their latest interaction:
User response: "{user_interaction}"
Current Knowledge History: {json.dumps(current_profile.get('knowledgeHistory', {}))}

Return JSON:
{{
  "topic": "{topic}",
  "estimated_mastery_score": 75, // 0 to 100
  "mastery_status": "learning", // "struggling", "learning", "mastered"
  "reasoning": "..."
}}
"""
    try:
        res = await llm.ainvoke([SystemMessage(content="Evaluate topic understanding."), HumanMessage(content=prompt)])
        content = res.content if isinstance(res.content, str) else str(res.content)
        data = json.loads(content)
        
        kh = dict(current_profile.get("knowledgeHistory") or {})
        kh[topic] = data.get("estimated_mastery_score", 50)
        
        mastered = list(current_profile.get("masteredTopics") or [])
        learning = list(current_profile.get("topicsBeingLearned") or [])
        
        if data.get("mastery_status") == "mastered" and topic not in mastered:
            mastered.append(topic)
            if topic in learning:
                learning.remove(topic)
        elif topic not in learning and topic not in mastered:
            learning.append(topic)
            
        return {
            "knowledgeHistory": kh,
            "masteredTopics": mastered,
            "topicsBeingLearned": learning,
            "last_estimation": data
        }
    except Exception as e:
        logger.error("KnowledgeEstimator failure", error=str(e))
        return {}


async def execute_quiz_generator(student_profile: dict, topic: str, difficulty: str = "medium") -> dict:
    """
    Tool: QuizGenerator
    Generates an interactive, format-tailored quiz question for the student.
    """
    logger.info("Executing QuizGeneratorTool", topic=topic, difficulty=difficulty)
    llm = _get_json_llm()
    
    prompt = QUIZ_GENERATOR_PROMPT.format(
        student_profile_json=json.dumps(student_profile),
        topic=topic or "General Learning",
        difficulty=difficulty
    )
    
    try:
        res = await llm.ainvoke([SystemMessage(content="Generate quiz question JSON."), HumanMessage(content=prompt)])
        content = res.content if isinstance(res.content, str) else str(res.content)
        quiz_data = json.loads(content)
        return quiz_data
    except Exception as e:
        logger.error("QuizGenerator failure", error=str(e))
        return {
            "type": "short_answer",
            "question": f"In your own words, what is the main concept of {topic}?",
            "correct_answer": "Open reflection",
            "explanation": "Reflecting on concepts helps build long-term memory.",
            "difficulty": difficulty,
            "topic": topic
        }


async def execute_homework_generator(student_profile: dict, topic: str) -> dict:
    """
    Tool: HomeworkGenerator
    Generates a personalized mini homework assignment.
    """
    logger.info("Executing HomeworkGeneratorTool", topic=topic)
    llm = _get_json_llm()
    
    prompt = HOMEWORK_GENERATOR_PROMPT.format(
        student_profile_json=json.dumps(student_profile),
        topic=topic or "General Learning"
    )
    
    try:
        res = await llm.ainvoke([SystemMessage(content="Generate homework assignment JSON."), HumanMessage(content=prompt)])
        content = res.content if isinstance(res.content, str) else str(res.content)
        return json.loads(content)
    except Exception as e:
        logger.error("HomeworkGenerator failure", error=str(e))
        return {
            "title": f"Explore {topic} in Daily Life",
            "description": "Observe and write down 2 real-world instances of this concept.",
            "tasks": ["Find 2 examples in daily life.", "Explain them in 2-3 sentences."],
            "estimated_minutes": 15
        }
