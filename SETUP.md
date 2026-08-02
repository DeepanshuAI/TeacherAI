# 🚀 TeacherAI — Complete Setup & Developer Guide

This document provides a comprehensive step-by-step walkthrough to clone, configure, migrate, run, and deploy the **TeacherAI** platform.

---

## 📋 Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Quick Start (Cloning & Post-Clone Setup)](#2-quick-start-cloning--post-clone-setup)
3. [Environment Variables Reference](#3-environment-variables-reference)
4. [Database & Prisma Setup](#4-database--prisma-setup)
5. [Redis & Infrastructure Setup](#5-redis--infrastructure-setup)
6. [Docker Setup (Development & Production)](#6-docker-setup-development--production)
7. [AI Provider Configuration (OpenAI & Anthropic)](#7-ai-provider-configuration-openai--anthropic)
8. [Google OAuth Setup](#8-google-oauth-setup)
9. [Running the Application](#9-running-the-application)
10. [Troubleshooting & Verification](#10-troubleshooting--verification)

---

## 1. Prerequisites

Before setting up TeacherAI, ensure you have the following installed on your host machine:

| Component | Minimum Version | Purpose |
|---|---|---|
| **Node.js** | `v18.17.0` or `v20+` | Web Frontend & API Server |
| **npm** | `v9+` | Package manager |
| **Python** | `v3.11+` | AI Microservice Engine |
| **PostgreSQL** | `v15+` (with `pgvector`) | Primary relational database & vector storage |
| **Redis** | `v7+` | Rate limiting, session caching & LangGraph state |
| **Docker & Docker Compose** | *(Optional for dev)* | Containerized environment deployment |

---

## 2. Quick Start (Cloning & Post-Clone Setup)

Follow these exact steps after cloning the repository:

```bash
# 1. Clone the repository
git clone https://github.com/DeepanshuAI/TeacherAI.git
cd TeacherAI

# 2. Copy root environment template
cp .env.example .env

# 3. Copy web app environment template
cp web/.env.example web/.env

# 4. Install Next.js Web App dependencies
cd web
npm install

# 5. Install Python AI Service dependencies
cd ../ai-service
pip install -r pyproject.toml # or pip install uvicorn fastapi pydantic pydantic-settings langchain langchain-openai langchain-anthropic langgraph psycopg[binary,pool] redis python-jose python-multipart pymupdf pillow pytesseract httpx structlog tenacity boto3 botocore
```

---

## 3. Environment Variables Reference

TeacherAI uses `.env` in the root directory as well as `web/.env` for local Next.js environment resolution.

### 🌐 Core Web App & AI Service Variables

| Variable Name | Description | Required / Optional | Example Value | Where to Obtain / Notes |
|---|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | **Required** | `postgresql://postgres:postgres@localhost:5432/teacherai_db` | Local PostgreSQL or Supabase / Neon connection string |
| `DIRECT_DATABASE_URL` | Direct DB string for Prisma migrations | **Required** | `postgresql://postgres:postgres@localhost:5432/teacherai_db` | Same as `DATABASE_URL` unless using a transaction pooler (e.g. PgBouncer) |
| `REDIS_URL` | Redis server connection URI | **Required** | `redis://localhost:6379/0` | Local Redis instance or Upstash Redis URL |
| `BETTER_AUTH_SECRET` | Session signing token secret | **Required** | `teacherai_super_secret_auth_token_32chars` | Generate via `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Base web application canonical URL | **Required** | `http://localhost:3000` | URL where web app is hosted |
| `NEXT_PUBLIC_APP_URL` | Public application endpoint | **Required** | `http://localhost:3000` | Exposed to browser for auth client & redirects |
| `NEXT_PUBLIC_APP_NAME` | Branding app title | Optional | `TeacherAI` | Rendered in navigation & page metadata |
| `AI_SERVICE_URL` | Internal FastAPI Service endpoint | **Required** | `http://localhost:8000` | Address of running Python AI Service |
| `AI_SERVICE_SECRET` | Shared secret between web & AI service | **Required** | `change_this_internal_service_secret` | Must match `SERVICE_SECRET` in `ai-service` |
| `SERVICE_SECRET` | Secret in Python AI Service config | **Required** | `change_this_internal_service_secret` | Must match `AI_SERVICE_SECRET` |
| `OPENAI_API_KEY` | OpenAI API Key for Socratic AI engine | **Required** *(for LLM)* | `sk-proj-YOUR_KEY` | Obtain from [OpenAI Platform](https://platform.openai.com) |
| `OPENAI_MODEL` | OpenAI Model selection | Optional | `gpt-4o` | Defaults to `gpt-4o` |
| `LLM_PROVIDER` | Selected LLM backend | Optional | `openai` | Supported: `openai` or `anthropic` |
| `ANTHROPIC_API_KEY` | Anthropic API Key | Optional | `sk-ant-YOUR_KEY` | Obtain from [Anthropic Console](https://console.anthropic.com) |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Optional | `12345.apps.googleusercontent.com` | Google Cloud Console -> APIs & Services |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Optional | `GOCSPX-abc123xyz` | Google Cloud Console -> APIs & Services |
| `S3_ENDPOINT` | MinIO / S3 Storage Endpoint | Optional | `http://localhost:9000` | S3 API endpoint URL |
| `S3_ACCESS_KEY` | S3 Access Key ID | Optional | `minioadmin` | S3 / MinIO admin access key |
| `S3_SECRET_KEY` | S3 Secret Access Key | Optional | `minioadmin` | S3 / MinIO secret key |
| `S3_BUCKET` | Uploads storage bucket | Optional | `teacherai-uploads` | Name of storage bucket |
| `ENVIRONMENT` | Runtime environment mode | Optional | `development` | Options: `development`, `production`, `test` |

---

## 4. Database & Prisma Setup

TeacherAI uses PostgreSQL with Prisma ORM for relational data (users, sessions, lesson histories, quiz attempts, achievements) and `pgvector` for document embedding vector search.

### Step 1: Create Database
Ensure PostgreSQL is running locally on port 5432, then run:

```sql
CREATE DATABASE teacherai_db;
```

### Step 2: Push Prisma Schema
To create all tables (`User`, `Session`, `Account`, `Verification`, `StudentProfile`, `LessonSession`, `QuizAttempt`, `Homework`, `UserAchievement`, `UploadedFile`):

```bash
cd web
npx prisma db push
```

### Step 3: Generate Prisma Client
```bash
npx prisma generate
```

---

## 5. Redis & Infrastructure Setup

Redis is used for:
1. **Chat Rate Limiting:** Restricting user requests per minute window.
2. **LangGraph Checkpoints:** Storing conversational state across Socratic tutoring nodes.

### Running Local Redis:
- **Windows (Native/WSL):** Install via WSL (`sudo apt install redis-server && sudo service redis-server start`) or use Docker.
- **Docker Command:**
  ```bash
  docker run -d --name teacherai-redis -p 6379:6379 redis:7-alpine
  ```

---

## 6. Docker Setup (Development & Production)

You can launch the entire stack (PostgreSQL, Redis, MinIO, AI Service, and Next.js Web App) with a single command.

### Development Stack
```bash
docker-compose up --build -d
```

### Production Stack
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

---

## 7. AI Provider Configuration (OpenAI & Anthropic)

TeacherAI features a LangGraph Socratic engine. To enable real-time response generation and Socratic guidance:

1. Obtain an API key from [OpenAI API Keys](https://platform.openai.com/api-keys).
2. Set `OPENAI_API_KEY` in root `.env` and `ai-service/app/core/config.py`.
3. Set `OPENAI_MODEL="gpt-4o"`.

*If using Anthropic:*
1. Set `LLM_PROVIDER="anthropic"`.
2. Set `ANTHROPIC_API_KEY="sk-ant-..."`.

---

## 8. Google OAuth Setup

To enable "Sign in with Google":

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project -> **APIs & Services** -> **OAuth consent screen**.
3. Go to **Credentials** -> **Create Credentials** -> **OAuth client ID**.
4. Select **Web application**.
5. Set Authorized redirect URIs:
   `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID & Client Secret to `.env`:
   ```env
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   ```

---

## 9. Running the Application

Start both microservices concurrently:

### Terminal 1: Next.js Web Frontend (Port 3000)
```bash
cd web
npm run dev
```
> Web Application will be available at **[http://localhost:3000](http://localhost:3000)**

### Terminal 2: Python FastAPI AI Engine (Port 8000)
```bash
cd ai-service
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
> AI Service Swagger Documentation will be available at **[http://localhost:8000/docs](http://localhost:8000/docs)**

---

## 10. Troubleshooting & Verification

### Verification Checklist
- ✅ Open `http://localhost:3000` -> Landing page renders with glassmorphism preview.
- ✅ Open `http://localhost:3000/sign-up` -> Register account `student@example.com` / `Password123!`.
- ✅ Open `http://localhost:8000/health` -> Returns `{"status": "healthy", "service": "teacherai-ai-service"}`.
