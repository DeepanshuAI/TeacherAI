"""
LangGraph StateGraph definition for the TeacherAI Agent.

The graph defines the Agentic execution loop:
1. `reason`: Analyzes student profile & incoming message to formulate internal strategy.
2. `tools`: Executes internal tools (ProfileUpdater, KnowledgeEstimator, QuizGenerator, etc.).
3. `generate`: Generates adaptive Socratic response.
"""

from langgraph.graph import END, START, StateGraph
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from app.agent.nodes import (
    node_analyze_intent,
    node_analyze_student,
    node_plan_teaching,
    node_generate_response,
    node_evaluate_learning,
    node_update_profile,
)
from app.agent.state import TeacherState


def build_teacher_graph() -> StateGraph:
    """Build and compile the modular Teacher AI Agent Brain StateGraph."""
    graph = StateGraph(TeacherState)

    # ── Register Modular Agent Cognitive Nodes ───────────────────────────
    graph.add_node("analyze_intent", node_analyze_intent)
    graph.add_node("analyze_student", node_analyze_student)
    graph.add_node("plan_teaching", node_plan_teaching)
    graph.add_node("generate", node_generate_response)
    graph.add_node("evaluate_learning", node_evaluate_learning)
    graph.add_node("update_profile", node_update_profile)

    # ── Sequential Cognitive Brain Pipeline Loop ─────────────────────────
    graph.add_edge(START, "analyze_intent")
    graph.add_edge("analyze_intent", "analyze_student")
    graph.add_edge("analyze_student", "plan_teaching")
    graph.add_edge("plan_teaching", "generate")
    graph.add_edge("generate", "evaluate_learning")
    graph.add_edge("evaluate_learning", "update_profile")
    graph.add_edge("update_profile", END)

    return graph


from typing import Any, Optional

async def get_compiled_graph(checkpointer: Optional[Any] = None):
    """Return a compiled graph with an optional checkpointer."""
    graph = build_teacher_graph()
    return graph.compile(checkpointer=checkpointer)
