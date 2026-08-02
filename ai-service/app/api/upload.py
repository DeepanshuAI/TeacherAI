"""File upload, text extraction, and vector indexing API."""

import io
import uuid
from typing import Annotated

import structlog
from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile, status
from pydantic import BaseModel

from app.core.config import settings
from app.core.security import verify_user_token
from app.services.storage import StorageService
from app.services.upload import DocumentProcessor

logger = structlog.get_logger(__name__)
router = APIRouter()

ALLOWED_MIME_TYPES = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "text/plain": ".txt",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


class UploadResponse(BaseModel):
    file_id: str
    filename: str
    size: int
    mime_type: str
    text_extracted: bool
    chunk_count: int
    s3_key: str


class QueryUploadsRequest(BaseModel):
    query: str
    file_ids: list[str]
    top_k: int = 5

    class Config:
        json_schema_extra = {
            "example": {
                "query": "What is the main topic of this document?",
                "file_ids": ["file-uuid-1", "file-uuid-2"],
                "top_k": 5,
            }
        }


@router.post("/file", response_model=UploadResponse)
async def upload_file(
    file: Annotated[UploadFile, File(description="PDF, image, or document file")],
    x_user_id: str = Header(..., alias="X-User-Id"),
    _auth=Depends(verify_user_token),
) -> UploadResponse:
    """
    Upload a file, extract its text, and index it for RAG queries.
    Supports: PDF, images (with OCR), Word documents, plain text.
    """
    # Validate file type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_MIME_TYPES.values())}",
        )

    # Read and validate file size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)} MB",
        )

    file_id = str(uuid.uuid4())
    extension = ALLOWED_MIME_TYPES[file.content_type]
    s3_key = f"uploads/{x_user_id}/{file_id}{extension}"

    try:
        # Upload to S3/MinIO
        storage = StorageService()
        await storage.upload(
            key=s3_key,
            data=content,
            content_type=file.content_type,
        )

        # Extract text and index chunks
        processor = DocumentProcessor()
        result = await processor.process(
            file_id=file_id,
            user_id=x_user_id,
            content=content,
            mime_type=file.content_type,
            filename=file.filename or f"file{extension}",
        )

        logger.info(
            "File uploaded and processed",
            file_id=file_id,
            user_id=x_user_id,
            chunks=result.chunk_count,
        )

        return UploadResponse(
            file_id=file_id,
            filename=file.filename or f"file{extension}",
            size=len(content),
            mime_type=file.content_type,
            text_extracted=result.text_extracted,
            chunk_count=result.chunk_count,
            s3_key=s3_key,
        )

    except Exception as e:
        logger.error("File upload failed", error=str(e), file_id=file_id)
        raise HTTPException(status_code=500, detail="File processing failed. Please try again.")


@router.post("/query")
async def query_uploads(
    request: QueryUploadsRequest,
    x_user_id: str = Header(..., alias="X-User-Id"),
    _auth=Depends(verify_user_token),
) -> dict:
    """
    Query uploaded documents using semantic search (RAG).
    Returns relevant text chunks from the specified files.
    """
    processor = DocumentProcessor()
    results = await processor.query(
        user_id=x_user_id,
        file_ids=request.file_ids,
        query=request.query,
        top_k=request.top_k,
    )

    return {
        "query": request.query,
        "results": results,
        "file_count": len(request.file_ids),
    }


@router.get("/list")
async def list_uploads(
    x_user_id: str = Header(..., alias="X-User-Id"),
    _auth=Depends(verify_user_token),
) -> dict:
    """List all uploaded files for the authenticated user."""
    processor = DocumentProcessor()
    files = await processor.list_user_files(x_user_id)
    return {"files": files, "total": len(files)}


@router.delete("/file/{file_id}")
async def delete_upload(
    file_id: str,
    x_user_id: str = Header(..., alias="X-User-Id"),
    _auth=Depends(verify_user_token),
) -> dict:
    """Delete an uploaded file and its vector index entries."""
    processor = DocumentProcessor()
    await processor.delete_file(file_id=file_id, user_id=x_user_id)
    return {"deleted": True, "file_id": file_id}
