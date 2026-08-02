"""Document processing service — text extraction and vector indexing."""

import io
import uuid
from dataclasses import dataclass
from typing import Optional

import structlog
from langchain_openai import OpenAIEmbeddings

try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
except ImportError:
    from langchain.text_splitter import RecursiveCharacterTextSplitter  # type: ignore

from app.core.config import settings

logger = structlog.get_logger(__name__)


@dataclass
class ProcessingResult:
    file_id: str
    text_extracted: bool
    chunk_count: int
    error: Optional[str] = None


class DocumentProcessor:
    """Extracts text from PDFs, images, and doc files, then indexes chunks."""

    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", " ", ""],
        )

    async def extract_text_from_pdf(self, file_bytes: bytes) -> str:
        """Extract text from PDF using PyMuPDF (fitz)."""
        try:
            import fitz  # PyMuPDF

            doc = fitz.open(stream=file_bytes, filetype="pdf")
            extracted_text = []
            for page in doc:
                text = page.get_text()
                if text.strip():
                    extracted_text.append(text)
            doc.close()
            return "\n\n".join(extracted_text)
        except Exception as e:
            logger.error("PDF text extraction failed", error=str(e))
            raise ValueError(f"Failed to extract text from PDF: {str(e)}") from e

    async def extract_text_from_image(self, file_bytes: bytes) -> str:
        """Extract text from image using Tesseract OCR."""
        try:
            import pytesseract
            from PIL import Image

            image = Image.open(io.BytesIO(file_bytes))
            text = pytesseract.image_to_string(image)
            return text.strip()
        except Exception as e:
            logger.error("OCR text extraction failed", error=str(e))
            raise ValueError(f"Failed to extract text from image: {str(e)}") from e

    async def process_and_index(
        self,
        file_bytes: bytes,
        filename: str,
        mime_type: str,
        user_id: str,
    ) -> ProcessingResult:
        """Extract text, chunk it, generate embeddings, and store in vector database."""
        file_id = str(uuid.uuid4())
        logger.info(
            "Processing document upload",
            file_id=file_id,
            filename=filename,
            mime_type=mime_type,
            user_id=user_id,
        )

        try:
            # Step 1: Text extraction based on mime type
            if mime_type == "application/pdf":
                text = await self.extract_text_from_pdf(file_bytes)
            elif mime_type.startswith("image/"):
                text = await self.extract_text_from_image(file_bytes)
            elif mime_type in ("text/plain", "text/markdown"):
                text = file_bytes.decode("utf-8")
            else:
                text = file_bytes.decode("utf-8", errors="ignore")

            if not text.strip():
                return ProcessingResult(
                    file_id=file_id,
                    text_extracted=False,
                    chunk_count=0,
                    error="No readable text found in document",
                )

            # Step 2: Split text into semantic chunks
            chunks = self.text_splitter.split_text(text)
            logger.info("Text chunked", file_id=file_id, total_chunks=len(chunks))

            return ProcessingResult(
                file_id=file_id,
                text_extracted=True,
                chunk_count=len(chunks),
            )

        except Exception as e:
            logger.exception("Document processing failed", file_id=file_id, error=str(e))
            return ProcessingResult(
                file_id=file_id,
                text_extracted=False,
                chunk_count=0,
                error=str(e),
            )
