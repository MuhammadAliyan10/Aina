// src/app/api/ai-assistant/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";

export async function GET(request: NextRequest) {
  const { user } = await validateRequest();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mock data (replace with real DB query)
  const data = [
    {
      id: "1",
      content: "Hello! How can I assist you today?",
      sender: "ai",
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    },
    {
      id: "2",
      content: "Can you help me with my workflow?",
      sender: "user",
      timestamp: new Date(Date.now() - 3500000).toISOString(), // 58 min ago
    },
  ];

  return NextResponse.json(data, { status: 200 });
}
