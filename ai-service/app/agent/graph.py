"""
LangGraph StateGraph definition for the TeacherAI agent.

The graph encodes the full teaching workflow as a directed graph with
conditional edges that route based on the current lesson phase.
"""

from langgraph.graph import END, START, StateGraph
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from app.agent.nodes import (
    node_assign_homework,
    node_clarify,
    node_evaluate,
    node_example,
    node_explain,
    node_explain_mistake,
    node_identify_level,
    node_plan_lesson,
    node_practice,
    node_quiz,
    node_summarize,
    node_update_memory,
)
from app.agent.state import LessonPhase, TeacherState


def _route_after_identify(state: TeacherState) -> str:
    """Route after level identification."""
    if state.get("needs_clarification"):
        return "clarify"
    if state["student_level"] == "unknown":
        return "identify_level"  # Keep asking
    return "plan_lesson"


def _route_after_clarify(state: TeacherState) -> str:
    """Route after clarification question answered."""
    return "identify_level"


def _route_after_evaluate(state: TeacherState) -> str:
    """Route based on whether student answered correctly."""
    phase = state.get("current_phase", LessonPhase.EVALUATE)
    incorrect = state.get("incorrect_answers", 0)

    if phase == LessonPhase.QUIZ:
        return "quiz"
    if phase == LessonPhase.EXPLAIN:
        return "explain"
    if incorrect >= 2:
        return "explain_mistake"
    return "practice"


def _route_after_explain_mistake(state: TeacherState) -> str:
    """After explaining a mistake, go back to practice with a simpler question."""
    return "practice"


def _route_after_explain(state: TeacherState) -> str:
    """After explanation, go to example."""
    return "example"


def _route_after_practice(state: TeacherState) -> str:
    """After asking a practice question, wait for student response via evaluate."""
    return "evaluate"


def _route_after_quiz(state: TeacherState) -> str:
    """After quiz, go to summarize."""
    return "summarize"


def _route_after_summarize(state: TeacherState) -> str:
    """After summary, assign homework."""
    return "assign_homework"


def _route_after_homework(state: TeacherState) -> str:
    """After homework, update memory then end."""
    return "update_memory"


def _route_after_memory(state: TeacherState) -> str:
    """End the session."""
    return END


def build_teacher_graph() -> StateGraph:
    """Build and compile the teacher agent StateGraph."""
    graph = StateGraph(TeacherState)

    # ── Register all nodes ────────────────────────────────────────────────
    graph.add_node("identify_level", node_identify_level)
    graph.add_node("clarify", node_clarify)
    graph.add_node("plan_lesson", node_plan_lesson)
    graph.add_node("explain", node_explain)
    graph.add_node("example", node_example)
    graph.add_node("practice", node_practice)
    graph.add_node("evaluate", node_evaluate)
    graph.add_node("explain_mistake", node_explain_mistake)
    graph.add_node("quiz", node_quiz)
    graph.add_node("summarize", node_summarize)
    graph.add_node("assign_homework", node_assign_homework)
    graph.add_node("update_memory", node_update_memory)

    # ── Entry point ───────────────────────────────────────────────────────
    graph.add_edge(START, "identify_level")

    # ── Conditional routing ───────────────────────────────────────────────
    graph.add_conditional_edges(
        "identify_level",
        _route_after_identify,
        {
            "clarify": "clarify",
            "identify_level": "identify_level",
            "plan_lesson": "plan_lesson",
        },
    )

    graph.add_edge("clarify", "identify_level")
    graph.add_edge("plan_lesson", "explain")
    graph.add_edge("explain", "example")
    graph.add_edge("example", "practice")
    graph.add_edge("practice", "evaluate")

    graph.add_conditional_edges(
        "evaluate",
        _route_after_evaluate,
        {
            "explain": "explain",
            "practice": "practice",
            "explain_mistake": "explain_mistake",
            "quiz": "quiz",
        },
    )

    graph.add_edge("explain_mistake", "practice")
    graph.add_edge("quiz", "summarize")
    graph.add_edge("summarize", "assign_homework")
    graph.add_edge("assign_homework", "update_memory")
    graph.add_edge("update_memory", END)

    return graph


async def get_compiled_graph(checkpointer: AsyncPostgresSaver):
    """Return a compiled graph with PostgreSQL checkpointer."""
    graph = build_teacher_graph()
    return graph.compile(checkpointer=checkpointer)
