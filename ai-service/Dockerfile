FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (tesseract-ocr for image processing, libfitz/pymupdf)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    tesseract-ocr \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast dependency resolution
RUN pip install --no-cache-dir uv

COPY pyproject.toml .
RUN uv pip install --system -r pyproject.toml

COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
