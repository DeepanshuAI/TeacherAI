"""Redis-based rate limiting middleware."""

import time
from typing import Optional

import structlog
from fastapi import HTTPException, Request, status

from app.core.config import settings
from app.core.redis_client import get_redis

logger = structlog.get_logger(__name__)


async def rate_limit(
    request: Request,
    user_id: Optional[str] = None,
    window: Optional[int] = None,
    max_requests: Optional[int] = None,
) -> None:
    """
    Sliding window rate limiter backed by Redis.
    Key is per-user or per-IP if no user_id provided.
    """
    redis = get_redis()
    window = window or settings.REDIS_RATE_LIMIT_WINDOW
    max_req = max_requests or settings.REDIS_RATE_LIMIT_MAX

    identifier = user_id or request.client.host if request.client else "unknown"
    key = f"rate_limit:{identifier}:{request.url.path}"

    now = time.time()
    window_start = now - window

    pipe = redis.pipeline()
    pipe.zremrangebyscore(key, 0, window_start)
    pipe.zadd(key, {str(now): now})
    pipe.zcard(key)
    pipe.expire(key, window)
    results = await pipe.execute()

    request_count = results[2]
    if request_count > max_req:
        logger.warning(
            "Rate limit exceeded",
            identifier=identifier,
            path=request.url.path,
            count=request_count,
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Try again in {window} seconds.",
            headers={"Retry-After": str(window)},
        )
