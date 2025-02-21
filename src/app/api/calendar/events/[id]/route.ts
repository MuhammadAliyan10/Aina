// src/app/api/calendar/events/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId, title, description, start, end } = body;

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mock updated event (replace with real DB update)
  const updatedEvent = {
    id: params.id,
    title,
    description,
    start,
    end,
    type: "event",
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(updatedEvent, { status: 200 });
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
