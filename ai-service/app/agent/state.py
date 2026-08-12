"""TeacherState — The shared state schema for the dynamic TeacherAI agent."""

from typing import Annotated, Any, Optional
from typing_extensions import TypedDict

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class TeacherState(TypedDict):
    """
    The shared state object for the AI Teacher Agent.
    """
    # --- Conversation ---
    messages: Annotated[list[BaseMessage], add_messages]

    # --- Session & Identity ---
    session_id: str
    user_id: str
    topic: Optional[str]

    # --- Comprehensive Student Profile ---
    student_profile: dict[str, Any]  # Stores name, age, gradeClass, board, subjects, strongTopics, weakTopics, knowledgeHistory, etc.

    # --- Modular Cognitive Brain Pipeline ---
    intent: Optional[dict[str, Any]]
    student_analysis: Optional[dict[str, Any]]
    teaching_strategy: Optional[str]
    learning_evaluation: Optional[dict[str, Any]]

    # --- Agent Reasoning & Execution ---
    internal_reasoning: Optional[str] # Internal chain of thought before generating response
    suggested_tool: Optional[str]     # e.g., "quiz_generator", "profile_updater", "knowledge_estimator", "revision_planner"
    tool_output: Optional[dict[str, Any]]

    # --- Active Quiz & Interactive Components ---
    active_quiz: Optional[dict[str, Any]]
    quiz_results: list[dict[str, Any]]

    # --- Control & Output ---
    last_teacher_message: str
    message_type: str                  # "text", "quiz", "summary", "onboarding"
    error: Optional[str]

