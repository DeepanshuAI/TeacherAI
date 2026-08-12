import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatSessions = await prisma.lessonSession.findMany({
      where: {
        userId: session.user.id,
        isArchived: false,
      },
      orderBy: [
        { isPinned: "desc" },
        { startedAt: "desc" },
      ],
      select: {
        id: true,
        threadId: true,
        title: true,
        topic: true,
        isPinned: true,
        startedAt: true,
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { content: true },
        },
      },
    });

    return NextResponse.json({ sessions: chatSessions });
  } catch (error) {
    console.error("GET /api/sessions error:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const threadId = body.threadId || uuidv4();
    const title = body.title || "New Conversation";
    const topic = body.topic || "General Learning";

    const newSession = await prisma.lessonSession.create({
      data: {
        userId: session.user.id,
        threadId,
        title,
        topic,
        phase: "interactive_chat",
      },
    });

    return NextResponse.json({ session: newSession });
  } catch (error) {
    console.error("POST /api/sessions error:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
