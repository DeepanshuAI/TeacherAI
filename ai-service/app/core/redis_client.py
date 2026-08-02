"""Redis client for caching and rate limiting."""

from typing import Optional

import redis.asyncio as aioredis
import structlog

from app.core.config import settings

logger = structlog.get_logger(__name__)

_redis_client: Optional[aioredis.Redis] = None


async def init_redis() -> None:
    """Initialize the Redis connection pool."""
    global _redis_client
    _redis_client = await aioredis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True,
        max_connections=20,
    )
    await _redis_client.ping()
    logger.info("Redis connected successfully")


async def close_redis() -> None:
    """Close Redis connection."""
    global _redis_client
    if _redis_client:
        await _redis_client.aclose()
        _redis_client = None


def get_redis() -> aioredis.Redis:
    """Get the Redis client instance."""
    if _redis_client is None:
        raise RuntimeError("Redis not initialized. Call init_redis() first.")
    return _redis_client
