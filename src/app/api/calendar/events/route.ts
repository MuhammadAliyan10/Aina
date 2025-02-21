// src/app/api/calendar/events/route.ts
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
      title: "Team Meeting",
      start: "2023-10-05T10:00:00Z",
      end: "2023-10-05T11:00:00Z",
      description: "Weekly sync-up",
      type: "event",
    },
    {
      id: "2",
      title: "Project Review",
      start: "2023-10-06T14:00:00Z",
      end: "2023-10-06T15:30:00Z",
      description: "Review project milestones",
      type: "event",
    },
  ];

  return NextResponse.json(data, { status: 200 });
}

export async function POST(request: NextRequest) {
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId, title, description, start, end } = body;

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mock response (replace with real DB logic)
  const newEvent = {
    id: Date.now().toString(),
    title,
    description,
    start,
    end,
    type: "event",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(newEvent, { status: 201 });
}
