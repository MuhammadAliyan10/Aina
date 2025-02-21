// src/app/api/documents/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId, title, content } = body;

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mock updated document (replace with real DB update)
  const updatedDoc = {
    id: params.id,
    title,
    content,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(updatedDoc, { status: 200 });
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
