// src/app/api/automation/workflows/[id]/simulate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId } = body;

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mock simulation result (replace with real simulation logic)
  const result = {
    id: params.id,
    message: "Workflow executed successfully with 2 steps completed.",
  };

  return NextResponse.json(result, { status: 200 });
}
