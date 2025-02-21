// src/app/api/ai-assistant/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { user } = await validateRequest();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const messages = await prisma.message.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        sender: true,
        createdAt: true,
      },
    });

    const data = messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      sender: msg.sender,
      timestamp: msg.createdAt.toISOString(),
    }));

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
