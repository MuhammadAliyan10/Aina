// src/app/api/analytics/ai/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";

export async function GET(request: NextRequest) {
  const { user } = await validateRequest();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const range = searchParams.get("range");

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mock data (replace with real DB query)
  const data = [
    { category: "Text Generation", value: 40 },
    { category: "Task Automation", value: 30 },
    { category: "Queries", value: 20 },
    { category: "Other", value: 10 },
  ];

  return NextResponse.json(data, { status: 200 });
}
