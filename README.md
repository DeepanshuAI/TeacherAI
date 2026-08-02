# Production AI Teacher Platform

An intelligent, interactive AI tutoring platform built with **Next.js 15 (App Router)**, **FastAPI**, **LangGraph**, **PostgreSQL with pgvector**, **Redis**, and **Better Auth**.

> 📖 **Complete Setup Guide:** For an in-depth step-by-step developer guide, environment variable explanations, database migrations, and OAuth setup, see [SETUP.md](file:///c:/Users/dell/OneDrive/Desktop/TeacherAI/SETUP.md).

---

## 🌟 Key Capabilities & Features

### 👩‍🏫 1. Truly Interactive AI Teacher (Not a Chatbot)
- **Step-by-Step Teaching:** Follows a 7-phase pedagogical model (Identify Level -> Clarify -> Plan Lesson -> Explain Concept -> Real-world Examples -> Practice Question -> Evaluate & Adapt -> Quiz -> Summary & Homework).
- **Concise & Socratic:** Never dumps walls of text. Teaches 1 idea at a time in 2-4 short paragraphs, ending with understanding checks.
- **Dynamic Difficulty:** Automatically adjusts difficulty (Easy, Medium, Hard) based on student quiz scores and response sentiment.

### 📝 2. Comprehensive Quiz Engine
- **5 Question Formats:** Multiple Choice Questions (MCQ), True/False, Fill in the Blanks, Short Answers, and Code Debugging/Fixes.
- **Partial Credit Evaluation:** Evaluates open-ended answers with partial credit scoring and detailed explanations.

### 🧠 3. Stateful Learning Memory & Personalization
- **LangGraph Checkpointing:** Uses `PostgresSaver` to persist conversation threads seamlessly across server restarts.
- **Student Profile Memory:** Tracks weak topics, strong topics, average scores, and learning speed in Redis and PostgreSQL.

### 📄 4. RAG Document Indexing (PDF, Image, Notes)
- **Multi-Type Extraction:** Extracts text from PDFs (PyMuPDF), Images (Tesseract OCR), Word Docs, and plain text.
- **pgvector Search:** Chunks and indexes uploaded materials for contextual retrieval when requested by the student.

### 🎙️ 5. Voice Learning Mode
- **Browser-Native STT:** Web Speech API integration for instant voice input.
- **TTS Support:** Text-to-Speech playback for a full hands-free tutoring experience.

---

## 🛠️ Architecture Overview

```
Browser (React + Framer Motion + TanStack Query)
       │
       ▼ HTTP / SSE Streaming
Next.js 15 App Router API (Proxy + Better Auth + Prisma)
       │
       ▼ Internal Service Auth
Python FastAPI Service (LangGraph StateGraph + PyMuPDF + Tesseract)
       │
       ├─► LangGraph PostgresSaver (Thread Checkpointer)
       ├─► OpenAI / Anthropic API (LLM Engine)
       ├─► PostgreSQL (pgvector + App Data)
       └─► Redis (Session Cache + Sliding Window Rate Limiting)
```

---

## 🚀 Quick Start (Local Development)

### Step 1: Clone & Set Environment Variables
```bash
git clone https://github.com/DeepanshuAI/TeacherAI.git
cd TeacherAI
cp .env.example .env
cp web/.env.example web/.env
```

### Step 2: Install Web & AI Dependencies
```bash
# Web frontend dependencies
cd web
npm install

# AI service dependencies
cd ../ai-service
pip install uvicorn fastapi pydantic pydantic-settings langchain langchain-openai langchain-anthropic langgraph psycopg[binary,pool] redis python-jose python-multipart pymupdf pillow pytesseract httpx structlog tenacity boto3 botocore
```

### Step 3: Run Database Migrations
```bash
cd web
npx prisma db push
npx prisma generate
```

### Step 4: Start AI Service (Python FastAPI)
```bash
cd ai-service
python -m uvicorn app.main:app --reload --port 8000
```

### Step 5: Start Next.js Frontend
```bash
cd web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Production Deployment

To build and launch the complete production stack (Web + AI Service + DB + Redis):

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

For detailed configuration parameters, see [SETUP.md](file:///c:/Users/dell/OneDrive/Desktop/TeacherAI/SETUP.md).
