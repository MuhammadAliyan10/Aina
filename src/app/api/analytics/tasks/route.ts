// src/app/api/analytics/tasks/route.ts
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
    { date: "2023-10-01", completed: 20, pending: 5 },
    { date: "2023-10-02", completed: 25, pending: 3 },
    { date: "2023-10-03", completed: 18, pending: 7 },
  ];

  return NextResponse.json(data, { status: 200 });
}
