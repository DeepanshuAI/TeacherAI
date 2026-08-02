/**
 * AI Service API client — wraps all communication with the Python FastAPI backend.
 * The Next.js layer proxies these calls, adding auth headers.
 */

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const AI_SERVICE_SECRET = process.env.AI_SERVICE_SECRET || "";

function buildHeaders(userId: string, userEmail: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${AI_SERVICE_SECRET}`,
    "X-User-Id": userId,
    "X-User-Email": userEmail,
  };
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "quiz" | "code" | "summary" | "homework";
  metadata?: Record<string, unknown>;
}

export interface StreamChunk {
  type: "token" | "node_start" | "done" | "error";
  content?: string;
  node?: string;
  message_type?: string;
  full_response?: string;
  message?: string;
}

/**
 * Stream a chat message to the teacher agent.
 * Returns an async generator that yields SSE-parsed chunks.
 */
export async function* streamChat(params: {
  message: string;
  sessionId: string;
  topic: string;
  studentName: string;
  userId: string;
  userEmail: string;
}): AsyncGenerator<StreamChunk> {
  const response = await fetch(`${AI_SERVICE_URL}/api/v1/chat/stream`, {
    method: "POST",
    headers: buildHeaders(params.userId, params.userEmail),
    body: JSON.stringify({
      message: params.message,
      session_id: params.sessionId,
      topic: params.topic,
      student_name: params.studentName,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Chat stream failed: ${response.status} ${error}`);
  }

  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") return;
          try {
            yield JSON.parse(data) as StreamChunk;
          } catch {
            // Ignore parse errors on partial chunks
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Get session state from the AI service.
 */
export async function getSession(params: {
  sessionId: string;
  userId: string;
  userEmail: string;
}): Promise<Record<string, unknown>> {
  const response = await fetch(
    `${AI_SERVICE_URL}/api/v1/chat/session/${params.sessionId}`,
    {
      headers: buildHeaders(params.userId, params.userEmail),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get session: ${response.status}`);
  }

  return response.json();
}

/**
 * Generate a quiz on a topic.
 */
export async function generateQuiz(params: {
  topic: string;
  questionType: string;
  difficulty: string;
  count: number;
  userId: string;
  userEmail: string;
}): Promise<{ questions: unknown[]; total: number }> {
  const response = await fetch(`${AI_SERVICE_URL}/api/v1/quiz/generate`, {
    method: "POST",
    headers: buildHeaders(params.userId, params.userEmail),
    body: JSON.stringify({
      topic: params.topic,
      question_type: params.questionType,
      difficulty: params.difficulty,
      count: params.count,
    }),
  });

  if (!response.ok) {
    throw new Error(`Quiz generation failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Evaluate a student's quiz answer.
 */
export async function evaluateAnswer(params: {
  question: Record<string, unknown>;
  studentAnswer: string;
  studentLevel: string;
  userId: string;
  userEmail: string;
}): Promise<{
  is_correct: boolean;
  score: number;
  explanation: string;
  correct_answer: string;
  feedback: string;
}> {
  const response = await fetch(`${AI_SERVICE_URL}/api/v1/quiz/evaluate`, {
    method: "POST",
    headers: buildHeaders(params.userId, params.userEmail),
    body: JSON.stringify({
      question: params.question,
      student_answer: params.studentAnswer,
      student_level: params.studentLevel,
    }),
  });

  if (!response.ok) {
    throw new Error(`Evaluation failed: ${response.status}`);
  }

  return response.json();
}
