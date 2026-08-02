"""TeacherState — The shared state schema for the LangGraph teacher agent."""

from typing import Annotated, Optional
from typing_extensions import TypedDict

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class LessonPhase(str):
    """Lesson phase constants."""
    IDENTIFY = "identify_level"
    CLARIFY = "clarify"
    PLAN = "plan_lesson"
    EXPLAIN = "explain"
    EXAMPLE = "example"
    PRACTICE = "practice"
    EVALUATE = "evaluate"
    QUIZ = "quiz"
    SUMMARIZE = "summarize"
    HOMEWORK = "assign_homework"
    COMPLETE = "complete"


class StudentLevel(str):
    """Student knowledge level constants."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    UNKNOWN = "unknown"


class TeacherState(TypedDict):
    """
    The shared state object for the teacher agent graph.
    All nodes read from and write to this state.
    """
    # --- Conversation ---
    messages: Annotated[list[BaseMessage], add_messages]

    # --- Session identity ---
    session_id: str
    user_id: str
    student_name: str

    # --- Current lesson context ---
    topic: str
    current_phase: str               # One of LessonPhase constants
    lesson_plan: Optional[list[str]]  # Ordered list of subtopics
    current_subtopic_index: int

    # --- Student profile (loaded from DB at session start) ---
    student_level: str               # One of StudentLevel constants
    weak_topics: list[str]
    strong_topics: list[str]
    learning_speed: str              # "slow", "average", "fast"
    previous_quiz_scores: list[float]
    completed_lessons: list[str]

    # --- Current lesson tracking ---
    questions_asked: int
    correct_answers: int
    incorrect_answers: int
    current_difficulty: str          # "easy", "medium", "hard"
    mistakes_this_session: list[str]
    examples_given: int

    # --- Quiz state ---
    active_quiz: Optional[dict]      # Current quiz being administered
    quiz_results: list[dict]

    # --- Control flow ---
    needs_clarification: bool
    clarification_question: Optional[str]
    lesson_complete: bool
    error: Optional[str]

    # --- Output for streaming ---
    last_teacher_message: str
    message_type: str                # "text", "quiz", "code", "summary", "homework"
