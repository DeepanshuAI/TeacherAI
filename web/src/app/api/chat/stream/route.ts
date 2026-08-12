import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { streamChat } from "@/lib/ai-client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Next.js proxy for the AI service chat stream endpoint.
 * Validates the user session here before forwarding to Python.
 */
export async function POST(request: NextRequest): Promise<Response> {
  // Verify session
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const sessionRecord = await prisma.lessonSession.findUnique({
    where: { threadId: body.session_id }
  });

  if (sessionRecord) {
    await prisma.lessonMessage.create({
      data: {
        sessionId: sessionRecord.id,
        role: "user",
        content: body.message,
      }
    });
  }

  // Create a ReadableStream that pipes from the AI service SSE
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const encoder = new TextEncoder();

        let fullResponse = "";
        let messageType = "text";

        for await (const chunk of streamChat({
          message: body.message,
          sessionId: body.session_id,
          topic: body.topic,
          studentName: session.user.name || "Student",
          userId: session.user.id,
          userEmail: session.user.email,
        })) {
          if (chunk.type === "token" && chunk.content) {
            fullResponse += chunk.content;
          } else if (chunk.type === "done" && chunk.full_response) {
            fullResponse = chunk.full_response;
            if (chunk.message_type) messageType = chunk.message_type;
          }

          const data = `data: ${JSON.stringify(chunk)}\n\n`;
          controller.enqueue(encoder.encode(data));
        }

        if (sessionRecord && fullResponse) {
          await prisma.lessonMessage.create({
            data: {
              sessionId: sessionRecord.id,
              role: "assistant",
              content: fullResponse,
              phase: messageType,
            }
          });
        }

        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Stream error";
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({ type: "error", message: errMsg })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
