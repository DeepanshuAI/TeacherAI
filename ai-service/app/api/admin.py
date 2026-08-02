"""Admin analytics and user management API."""

import structlog
from fastapi import APIRouter, Depends, Header
from pydantic import BaseModel

from app.core.security import verify_service_token
from app.core.database import get_db

logger = structlog.get_logger(__name__)
router = APIRouter()


@router.get("/stats")
async def get_global_stats(
    _auth=Depends(verify_service_token),
) -> dict:
    """Get platform-wide usage statistics."""
    return {
        "total_sessions": 0,
        "total_messages": 0,
        "total_quizzes": 0,
        "active_users_today": 0,
        "average_session_duration_minutes": 0,
        "top_topics": [],
    }


@router.get("/users/{user_id}/analytics")
async def get_user_analytics(
    user_id: str,
    _auth=Depends(verify_service_token),
) -> dict:
    """Get detailed analytics for a specific user."""
    return {
        "user_id": user_id,
        "total_lessons": 0,
        "total_quiz_attempts": 0,
        "average_quiz_score": 0,
        "strong_topics": [],
        "weak_topics": [],
        "learning_streak_days": 0,
        "mastery_percentage": 0,
        "recent_sessions": [],
    }
