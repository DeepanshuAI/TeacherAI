"""TeacherAI AI Service — FastAPI Application Entry Point."""

import sys
import asyncio

# Fix psycopg 3 Windows async event loop compatibility
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from contextlib import asynccontextmanager
from typing import AsyncGenerator

import structlog
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app.api import admin, chat, quiz, upload
from app.core.config import settings
from app.core.database import init_db
from app.core.redis_client import init_redis, close_redis

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan: startup and shutdown events."""
    logger.info("TeacherAI AI Service starting up", version="0.1.0")
    try:
        await init_db()
    except Exception as e:
        logger.warning("Database init fallback (offline/demo mode)", error=str(e))

    try:
        await init_redis()
    except Exception as e:
        logger.warning("Redis init fallback (offline/demo mode)", error=str(e))

    yield

    logger.info("TeacherAI AI Service shutting down")
    await close_redis()


app = FastAPI(
    title="TeacherAI AI Service",
    description="Intelligent Socratic AI teacher engine powered by LangGraph",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Include API Routers
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(quiz.router, prefix="/api/v1/quiz", tags=["Quiz"])
app.include_router(upload.router, prefix="/api/v1/upload", tags=["Upload"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])


@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": "teacherai-ai-service",
        "environment": settings.ENVIRONMENT,
    }


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
