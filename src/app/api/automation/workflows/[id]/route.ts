// src/app/api/automation/workflows/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId, name, description, steps, status } = body;

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mock updated workflow (replace with real DB update)
  const updatedWorkflow = {
    id: params.id,
    name,
    description,
    steps,
    updatedAt: new Date().toISOString(),
    status,
  };

  return NextResponse.json(updatedWorkflow, { status: 200 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId } = body;

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mock success (replace with real DB deletion)
  return NextResponse.json({ success: true }, { status: 200 });
}
