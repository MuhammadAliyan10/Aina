// src/app/api/integrations/[id]/connect/route.ts
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

  // Mock success (replace with real integration logic, e.g., OAuth flow)
  return NextResponse.json({ success: true }, { status: 200 });
}
