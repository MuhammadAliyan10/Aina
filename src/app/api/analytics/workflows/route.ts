// src/app/api/analytics/workflows/route.ts
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
    { name: "Email Automation", executions: 120, successRate: 95 },
    { name: "Daily Tasks", executions: 80, successRate: 88 },
    { name: "Report Generation", executions: 50, successRate: 92 },
  ];

  return NextResponse.json(data, { status: 200 });
}
