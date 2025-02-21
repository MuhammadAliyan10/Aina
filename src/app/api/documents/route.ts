// src/app/api/documents/route.ts
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
      title: "Meeting Notes",
      content: "Notes from the team meeting on 2023-10-01.",
      createdAt: "2023-10-01T10:00:00Z",
      updatedAt: "2023-10-01T10:00:00Z",
    },
    {
      id: "2",
      title: "Project Plan",
      content: "Detailed plan for Project X.",
      createdAt: "2023-09-15T14:30:00Z",
      updatedAt: "2023-10-02T09:15:00Z",
    },
  ];

  return NextResponse.json(data, { status: 200 });
}

export async function POST(request: NextRequest) {
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId, title, content } = body;

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mock response (replace with real DB logic)
  const newDoc = {
    id: Date.now().toString(),
    title: title || "Untitled Document",
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(newDoc, { status: 201 });
}
