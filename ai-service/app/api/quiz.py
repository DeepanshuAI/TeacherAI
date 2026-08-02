"""Quiz generation and evaluation API."""

import json

import structlog
from fastapi import APIRouter, Depends, Header, HTTPException
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, field_validator

from app.agent.nodes import _get_json_llm
from app.agent.prompts import QUIZ_PROMPT, TEACHER_SYSTEM_PROMPT
from app.core.config import settings
from app.core.security import verify_user_token

logger = structlog.get_logger(__name__)
router = APIRouter()

QUESTION_TYPES = ["mcq", "true_false", "fill_blank", "short_answer", "code"]
DIFFICULTIES = ["easy", "medium", "hard"]


class QuizGenerateRequest(BaseModel):
    topic: str
    question_type: str = "mcq"
    difficulty: str = "medium"
    count: int = 5

    @field_validator("question_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in QUESTION_TYPES:
            raise ValueError(f"question_type must be one of {QUESTION_TYPES}")
        return v

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, v: str) -> str:
        if v not in DIFFICULTIES:
            raise ValueError(f"difficulty must be one of {DIFFICULTIES}")
        return v

    @field_validator("count")
    @classmethod
    def validate_count(cls, v: int) -> int:
        if not 1 <= v <= 20:
            raise ValueError("count must be between 1 and 20")
        return v


class QuizEvaluateRequest(BaseModel):
    question: dict
    student_answer: str
    student_level: str = "intermediate"

    @field_validator("student_answer")
    @classmethod
    def sanitize_answer(cls, v: str) -> str:
        return v.strip()[:2000]


class QuizEvaluateResponse(BaseModel):
    is_correct: bool
    score: float  # 0.0 to 1.0
    explanation: str
    correct_answer: str
    feedback: str


@router.post("/generate")
async def generate_quiz(
    request: QuizGenerateRequest,
    x_user_id: str = Header(..., alias="X-User-Id"),
    _auth=Depends(verify_user_token),
) -> dict:
    """Generate a set of quiz questions for a topic."""
    llm = _get_json_llm()

    prompt = f"""Generate {request.count} quiz questions about "{request.topic}".
    
Question type: {request.question_type}
Difficulty: {request.difficulty}

Return valid JSON in this format:
{{
  "questions": [
    {{
      "id": "q1",
      "type": "{request.question_type}",
      "question": "...",
      "options": ["A: ...", "B: ...", "C: ...", "D: ..."],
      "correct_answer": "...",
      "explanation": "2-sentence explanation of the correct answer",
      "difficulty": "{request.difficulty}",
      "topic": "{request.topic}",
      "points": 10
    }}
  ]
}}

For true_false: options should be ["True", "False"]
For fill_blank: use ___ in the question for the blank
For short_answer/code: omit options field
"""

    response = await llm.ainvoke([
        SystemMessage(content="You are a quiz generator. Return valid JSON only."),
        HumanMessage(content=prompt),
    ])

    try:
        data = json.loads(response.content)
        return {
            "topic": request.topic,
            "difficulty": request.difficulty,
            "question_type": request.question_type,
            "questions": data.get("questions", []),
            "total": len(data.get("questions", [])),
        }
    except json.JSONDecodeError as e:
        logger.error("Quiz generation JSON parse error", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to generate quiz. Please try again.")


@router.post("/evaluate", response_model=QuizEvaluateResponse)
async def evaluate_answer(
    request: QuizEvaluateRequest,
    x_user_id: str = Header(..., alias="X-User-Id"),
    _auth=Depends(verify_user_token),
) -> QuizEvaluateResponse:
    """Evaluate a student's answer to a quiz question."""
    llm = _get_json_llm()

    question_data = request.question
    q_type = question_data.get("type", "short_answer")
    correct = question_data.get("correct_answer", "")

    eval_prompt = f"""Evaluate this student's answer:

Question: {question_data.get('question', '')}
Question Type: {q_type}
Correct Answer: {correct}
Student's Answer: {request.student_answer}
Student Level: {request.student_level}

Return JSON:
{{
  "is_correct": true/false,
  "score": 0.0 to 1.0,
  "explanation": "Why the correct answer is correct (2 sentences)",
  "correct_answer": "{correct}",
  "feedback": "Personalized, encouraging feedback for the student (2-3 sentences)"
}}

For MCQ/True-False: is_correct is binary (0 or 1 score)
For short_answer/code: use partial credit (0.0-1.0) based on coverage of key concepts
"""

    response = await llm.ainvoke([
        SystemMessage(content="You are a quiz evaluator. Return valid JSON only."),
        HumanMessage(content=eval_prompt),
    ])

    try:
        data = json.loads(response.content)
        return QuizEvaluateResponse(
            is_correct=data.get("is_correct", False),
            score=float(data.get("score", 0.0)),
            explanation=data.get("explanation", ""),
            correct_answer=data.get("correct_answer", correct),
            feedback=data.get("feedback", ""),
        )
    except (json.JSONDecodeError, ValueError) as e:
        logger.error("Quiz evaluation error", error=str(e))
        raise HTTPException(status_code=500, detail="Evaluation failed. Please try again.")
