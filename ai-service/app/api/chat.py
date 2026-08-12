"""
Chat API router — SSE streaming endpoint for the teacher agent.

Flow:
  POST /api/v1/chat/stream
  → Validates user (via X-User-* headers from Next.js proxy)
  → Loads student profile from Redis / DB
  → Invokes LangGraph graph with current state
  → Streams token-by-token response via SSE
"""

import asyncio
import json
from typing import AsyncGenerator

import structlog
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.checkpoint.memory import MemorySaver
from pydantic import BaseModel, field_validator
import psycopg

_in_memory_checkpointer = MemorySaver()

from app.agent.graph import get_compiled_graph
from app.core.config import settings
from app.core.rate_limit import rate_limit
from app.core.security import verify_user_token
from app.services.memory import StudentMemoryService

logger = structlog.get_logger(__name__)
router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: str
    topic: str
    student_name: str = "Student"

    @field_validator("message")
    @classmethod
    def sanitize_message(cls, v: str) -> str:
        v = v.strip()
        if len(v) > 4000:
            raise ValueError("Message too long (max 4000 characters)")
        if not v:
            raise ValueError("Message cannot be empty")
        return v

    @field_validator("topic")
    @classmethod
    def sanitize_topic(cls, v: str) -> str:
        return v.strip()[:200]


def _get_checkpointer_conn_str() -> str:
    """Build psycopg-compatible connection string."""
    url = settings.DATABASE_URL
    # Convert SQLAlchemy URL to psycopg format
    return url.replace("postgresql+asyncpg://", "postgresql://").replace(
        "postgresql+psycopg://", "postgresql://"
    )


async def _stream_teacher_response(
    request: ChatRequest,
    user_id: str,
    memory_service: StudentMemoryService,
) -> AsyncGenerator[str, None]:
    """Core streaming logic — runs graph and yields SSE events."""

    checkpointer = None
    conn = None

    try:
        conn_str = _get_checkpointer_conn_str()
        conn = await psycopg.AsyncConnection.connect(conn_str, autocommit=True)
        checkpointer = AsyncPostgresSaver(conn)
        await checkpointer.setup()
    except Exception as e:
        logger.warning("PostgreSQL checkpointer unavailable, using in-memory fallback", error=str(e))
        checkpointer = _in_memory_checkpointer

    try:
        compiled = await get_compiled_graph(checkpointer)

        # Load student profile from memory
        profile = await memory_service.get_profile(user_id)

        thread_config = {
            "configurable": {"thread_id": request.session_id}
        }

        # Get existing state for this thread (if resuming)
        existing_state = await compiled.aget_state(thread_config)
        has_existing = bool(existing_state and existing_state.values)

        if has_existing:
            # Resuming existing session — just inject the new message
            input_state = {
                "messages": [HumanMessage(content=request.message)]
            }
        else:
            # New session — initialize full agent state
            input_state = {
                "messages": [HumanMessage(content=request.message)],
                "session_id": request.session_id,
                "user_id": user_id,
                "topic": request.topic or "General Learning",
                "student_profile": profile or {},
                "internal_reasoning": None,
                "suggested_tool": "chat",
                "tool_output": None,
                "active_quiz": None,
                "quiz_results": [],
                "last_teacher_message": "",
                "message_type": "text",
                "error": None,
            }

        # Stream events from LangGraph
        full_response = ""
        message_type = "text"
        current_node = ""

        async for event in compiled.astream_events(
            input_state,
            config=thread_config,
            version="v2",
        ):
            kind = event.get("event", "")
            name = event.get("name", "")

            if kind == "on_chat_model_stream" and current_node == "generate":
                chunk = event.get("data", {}).get("chunk")
                if chunk and hasattr(chunk, "content") and chunk.content:
                    c = chunk.content
                    if isinstance(c, str):
                        token = c
                    elif isinstance(c, list):
                        parts = []
                        for item in c:
                            if isinstance(item, str):
                                parts.append(item)
                            elif isinstance(item, dict) and item.get("type") == "text":
                                parts.append(item.get("text", ""))
                        token = "".join(parts)
                    else:
                        token = str(c)

                    if token:
                        full_response += token
                        yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"

            elif kind == "on_chain_start" and name not in ("LangGraph", "__start__"):
                current_node = name
                yield f"data: {json.dumps({'type': 'node_start', 'node': name})}\n\n"

            elif kind == "on_chain_end" and name not in ("LangGraph", "__start__"):
                # Capture message_type from state updates
                output = event.get("data", {}).get("output", {})
                if isinstance(output, dict):
                    message_type = output.get("message_type", message_type)
                    if name == "generate" and "last_teacher_message" in output:
                        full_response = output.get("last_teacher_message", full_response)

        # Send completion event
        yield f"data: {json.dumps({'type': 'done', 'message_type': message_type, 'full_response': full_response})}\n\n"
        yield "data: [DONE]\n\n"

        # Persist updated profile asynchronously
        final_state = await compiled.aget_state(thread_config)
        if final_state and final_state.values:
            await memory_service.update_profile(user_id, final_state.values)
    finally:
        if conn:
            await conn.close()


@router.post("/stream")
async def stream_chat(
    request: ChatRequest,
    req: Request,
    x_user_id: str = Header(..., alias="X-User-Id"),
    x_user_email: str = Header(..., alias="X-User-Email"),
    _auth=Depends(verify_user_token),
) -> StreamingResponse:
    """
    Stream teacher responses via Server-Sent Events.
    Requires X-User-Id and X-User-Email headers set by Next.js proxy.
    """
    await rate_limit(req, user_id=x_user_id, max_requests=60, window=60)

    memory_service = StudentMemoryService()

    async def event_generator():
        try:
            async for chunk in _stream_teacher_response(request, x_user_id, memory_service):
                yield chunk
        except asyncio.CancelledError:
            logger.info("Stream cancelled by client", user_id=x_user_id)
        except Exception as e:
            logger.error("Stream error", error=str(e), user_id=x_user_id)
            yield f"data: {json.dumps({'type': 'error', 'message': 'An error occurred. Please try again.'})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/session/{session_id}")
async def get_session(
    session_id: str,
    x_user_id: str = Header(..., alias="X-User-Id"),
    _auth=Depends(verify_user_token),
) -> dict:
    """Get the current state of a session."""
    conn_str = _get_checkpointer_conn_str()
    async with await psycopg.AsyncConnection.connect(conn_str, autocommit=True) as conn:
        checkpointer = AsyncPostgresSaver(conn)
        compiled_graph = await get_compiled_graph(checkpointer)
        state = await compiled_graph.aget_state(
            {"configurable": {"thread_id": session_id}}
        )
        if not state or not state.values:
            raise HTTPException(status_code=404, detail="Session not found")

        values = state.values
        return {
            "session_id": session_id,
            "topic": values.get("topic", ""),
            "current_phase": values.get("current_phase", ""),
            "student_level": values.get("student_level", ""),
            "lesson_plan": values.get("lesson_plan", []),
            "current_subtopic_index": values.get("current_subtopic_index", 0),
            "correct_answers": values.get("correct_answers", 0),
            "questions_asked": values.get("questions_asked", 0),
            "lesson_complete": values.get("lesson_complete", False),
            "message_count": len(values.get("messages", [])),
        }
