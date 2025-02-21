// src/app/api/tasks/route.ts
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
      title: "Prepare Presentation",
      description: "Slides for Monday meeting",
      status: "in_progress",
      dueDate: "2023-10-10",
      createdAt: "2023-10-01T10:00:00Z",
      updatedAt: "2023-10-02T14:00:00Z",
    },
    {
      id: "2",
      title: "Review Code",
      description: "Check pull request #123",
      status: "pending",
      dueDate: "2023-10-15",
      createdAt: "2023-10-01T12:00:00Z",
      updatedAt: "2023-10-01T12:00:00Z",
    },
    {
      id: "3",
      title: "Send Report",
      description: "Monthly sales report",
      status: "completed",
      dueDate: "2023-09-30",
      createdAt: "2023-09-25T09:00:00Z",
      updatedAt: "2023-09-30T15:00:00Z",
    },
  ];

  return NextResponse.json(data, { status: 200 });
}

export async function POST(request: NextRequest) {
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId, title, description, dueDate, status } = body;

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mock response (replace with real DB logic)
  const newTask = {
    id: Date.now().toString(),
    title: title || "Untitled Task",
    description,
    status,
    dueDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(newTask, { status: 201 });
}
