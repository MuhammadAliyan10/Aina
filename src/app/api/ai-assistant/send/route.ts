// src/app/api/ai-assistant/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";

export async function POST(request: NextRequest) {
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId, content } = body;

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mock AI response (replace with real AI integration, e.g., OpenAI API)
  const aiResponse = {
    id: Date.now().toString(),
    content: `I'm here to help! What specifically do you need assistance with regarding your workflow?`,
    sender: "ai",
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(aiResponse, { status: 200 });
}
