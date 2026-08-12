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
            "name": None,
            "age": None,
            "gradeClass": None,
            "board": None,
            "preferredLanguage": "English",
            "subjects": [],
            "strongTopics": [],
            "weakTopics": [],
            "learningStyle": "visual_interactive",
            "confidenceLevel": "building",
            "attentionSpan": "medium",
            "readingLevel": "grade_appropriate",
            "writingLevel": "grade_appropriate",
            "interests": [],
            "careerGoals": [],
            "learningPace": "adaptable",
            "recentMistakes": [],
            "frequentlyAskedQuestions": [],
            "knowledgeHistory": {},
            "masteredTopics": [],
            "topicsBeingLearned": [],
            "quizPerformance": {},
            "revisionHistory": []
        }

    async def update_profile(self, user_id: str, state: dict) -> None:
        """Persist updated profile to Redis after a session."""
        try:
            redis = get_redis()
            key = f"student_profile:{user_id}"
            
            profile = state.get("student_profile") or {}
            profile["user_id"] = user_id

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
