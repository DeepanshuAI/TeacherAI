# TeacherAI Deployment Guide

TeacherAI consists of a **Next.js frontend/backend** and a **FastAPI AI Service**. To deploy this full-stack application to production, you will need to host both services and provision two databases (PostgreSQL and Redis).

## Prerequisites

- **PostgreSQL Database**: For user authentication, sessions, and chat history.
- **Redis Instance**: For LangGraph AI agent state management, caching, and rate limiting.
- **Vercel Account** (Recommended): For hosting the Next.js web application.
- **Render / Railway / Fly.io Account**: For hosting the Python FastAPI AI Service.
- **Google Gemini API Key**: For the AI agent capabilities.

---

## 1. Provision Databases

You need managed databases accessible from the internet.

### PostgreSQL
You can use services like **Supabase**, **Neon.tech**, or **Render PostgreSQL**.
- Create a new project/database.
- Obtain the connection string (URI) which looks like: `postgresql://user:password@host:port/dbname`

### Redis
You can use services like **Upstash** or **Render Redis**.
- Create a new Redis database.
- Obtain the connection string (URI) which looks like: `redis://default:password@host:port`

---

## 2. Deploy the AI Service (FastAPI)

The AI service needs a Python environment. **Render** or **Railway** are great choices for this.

1. **Create a new Web Service** on Render or Railway.
2. Connect your GitHub repository (`DeepanshuAI/TeacherAI`).
3. Set the **Root Directory** to `ai-service`.
4. Set the build and start commands:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables**: Add the following:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `REDIS_URL`: Your Redis connection string.
   - `POSTGRES_URL`: Your PostgreSQL connection string (for AI checkpoints).
   - `API_SECRET`: A secure random string (e.g., `your_secure_ai_secret_token_123`) to secure communications between the Next.js app and the AI service.

6. **Deploy** the service and copy the provided public URL (e.g., `https://teacherai-service.onrender.com`).

---

## 3. Deploy the Web App (Next.js)

The Next.js application is best deployed on **Vercel**.

1. Create a new project on **Vercel** and connect your GitHub repository (`DeepanshuAI/TeacherAI`).
2. Set the **Root Directory** to `web`.
3. Vercel will automatically detect the Next.js framework.
4. **Environment Variables**: Add the following in the Vercel dashboard before deploying:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `NEXT_PUBLIC_APP_URL`: The URL of your Vercel deployment (e.g., `https://teacherai.vercel.app`).
   - `BETTER_AUTH_SECRET`: A secure random string for user authentication cookies.
   - `BETTER_AUTH_URL`: Same as `NEXT_PUBLIC_APP_URL`.
   - `AI_SERVICE_URL`: The public URL of your deployed AI service (e.g., `https://teacherai-service.onrender.com`).
   - `AI_SERVICE_SECRET`: The exact same secret you set as `API_SECRET` in the AI Service.

5. **Deploy** the project. Vercel will run `npm install` and `npm run build`.

### Database Migrations (Post-Deployment)
Once Vercel finishes deploying, you need to push the database schema to your production PostgreSQL database.
- If you have the database connected locally, you can run: 
  `npx prisma db push` (Make sure your local `.env` has the production `DATABASE_URL`)
- Alternatively, you can add a script to your `package.json` to run migrations during the Vercel build phase:
  `"build": "prisma generate && prisma db push && next build"`

---

## 4. Verify the Deployment

1. Visit your Vercel frontend URL.
2. Create a new account or sign in.
3. Start a new chat to verify that the Next.js app is successfully communicating with the Python AI Service.
4. Refresh the page to ensure your chat history is saving properly to the PostgreSQL database.

## Notes on Production
- In production, ensure you do not use `npm run dev` or `--reload` flags.
- You can restrict CORS on the AI service to only accept requests from your Vercel domain.
