import pytest
from app.agent.state import LessonPhase, StudentLevel, TeacherState
from app.agent.nodes import _infer_level_from_conversation, _assess_correctness, _parse_lesson_plan
from langchain_core.messages import HumanMessage, AIMessage

def test_infer_level_beginner():
    messages = [HumanMessage(content="I've never done Python before, I am a total beginner.")]
    level = _infer_level_from_conversation(messages, "Python")
    assert level == StudentLevel.BEGINNER

def test_infer_level_advanced():
    messages = [HumanMessage(content="I am experienced with Python in production, looking to optimize decorators.")]
    level = _infer_level_from_conversation(messages, "Python")
    assert level == StudentLevel.ADVANCED

def test_assess_correctness():
    assert _assess_correctness("Exactly right! Excellent job.") is True
    assert _assess_correctness("Not quite. Let me give you a hint.") is False

def test_parse_lesson_plan():
    raw_plan = """
1. Functions syntax
2. Parameters and Return values
3. Scope and Lifetime
    """
    plan = _parse_lesson_plan(raw_plan, "Python Functions")
    assert len(plan) == 3
    assert plan[0] == "Functions syntax"
    assert plan[1] == "Parameters and Return values"
