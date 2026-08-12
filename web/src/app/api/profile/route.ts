import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      profile = await prisma.studentProfile.create({
        data: {
          userId: session.user.id,
          name: session.user.name || "Student",
        },
      });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json({ error: "Failed to fetch student profile" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates = await request.json();

    const updated = await prisma.studentProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...updates,
      },
      update: updates,
    });

    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error("PATCH /api/profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
