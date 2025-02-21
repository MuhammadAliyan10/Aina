// src/app/api/ai-assistant/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId, content } = body;

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  try {
    const userMessage = await prisma.message.create({
      data: {
        userId: user.id,
        content,
        sender: "user",
      },
    });

    // Simulate AI response (replace with real AI integration, e.g., OpenAI)
    const aiResponse = await prisma.message.create({
      data: {
        userId: user.id,
        content: `I'm here to help! What specifically do you need assistance with regarding "${content}"?`,
        sender: "ai",
      },
    });

    const responseData = {
      id: aiResponse.id,
      content: aiResponse.content,
      sender: aiResponse.sender,
      timestamp: aiResponse.createdAt.toISOString(),
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
