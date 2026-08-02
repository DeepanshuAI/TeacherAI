"""Student memory service — load and persist student profiles."""

import json
from typing import Optional

import structlog

from app.core.redis_client import get_redis

logger = structlog.get_logger(__name__)

PROFILE_TTL = 86400 * 7  # 7 days cache TTL


class StudentMemoryService:
    """Manages student learning profiles using Redis for caching."""

    async def get_profile(self, user_id: str) -> dict:
        """Load student profile from Redis cache (or return defaults)."""
        try:
            redis = get_redis()
            key = f"student_profile:{user_id}"
            cached = await redis.get(key)
            if cached:
                return json.loads(cached)
        except Exception as e:
            logger.warning("Redis profile lookup fallback", user_id=user_id, error=str(e))

        # Return default profile for new students
        return {
            "user_id": user_id,
            "level": "unknown",
            "weak_topics": [],
            "strong_topics": [],
            "learning_speed": "average",
            "quiz_scores": [],
            "completed_lessons": [],
            "total_sessions": 0,
        }

    async def update_profile(self, user_id: str, state: dict) -> None:
        """Persist updated profile to Redis after a session."""
        try:
            redis = get_redis()
            key = f"student_profile:{user_id}"

            profile = {
                "user_id": user_id,
                "level": state.get("student_level", "unknown"),
                "weak_topics": state.get("weak_topics", []),
                "strong_topics": state.get("strong_topics", []),
                "learning_speed": state.get("learning_speed", "average"),
                "quiz_scores": state.get("quiz_results", []),
                "completed_lessons": state.get("completed_lessons", []),
            }

            await redis.setex(key, PROFILE_TTL, json.dumps(profile))
            logger.info("Student profile updated", user_id=user_id)
        except Exception as e:
            logger.warning("Redis profile update fallback", user_id=user_id, error=str(e))

    async def get_session_context(self, user_id: str, topic: str) -> Optional[str]:
        """Get a summary of the student's history with this topic for context injection."""
        profile = await self.get_profile(user_id)

        context_parts = []
        if topic in profile.get("strong_topics", []):
            context_parts.append(f"The student has demonstrated strong understanding of {topic}.")
        if topic in profile.get("weak_topics", []):
            context_parts.append(f"The student has previously struggled with {topic}. Be extra patient.")

        scores = [
            s for s in profile.get("quiz_scores", [])
            if s.get("topic") == topic
        ]
        if scores:
            avg = sum(s.get("score", 0) for s in scores) / len(scores)
            context_parts.append(f"Previous quiz average on this topic: {avg:.0f}%")

        return " ".join(context_parts) if context_parts else None
