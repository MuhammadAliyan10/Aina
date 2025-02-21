// src/app/api/automation/workflows/route.ts
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
      name: "Email Automation",
      description: "Send emails based on triggers",
      steps: [
        {
          id: "s1",
          type: "trigger",
          name: "New Subscriber",
          config: {},
          order: 0,
        },
        {
          id: "s2",
          type: "action",
          name: "Send Welcome Email",
          config: {},
          order: 1,
        },
      ],
      createdAt: "2023-10-01T10:00:00Z",
      updatedAt: "2023-10-01T10:00:00Z",
      status: "active",
    },
    {
      id: "2",
      name: "Daily Report",
      description: "Generate daily sales report",
      steps: [
        {
          id: "s3",
          type: "trigger",
          name: "Daily Schedule",
          config: {},
          order: 0,
        },
        {
          id: "s4",
          type: "action",
          name: "Generate Report",
          config: {},
          order: 1,
        },
        { id: "s5", type: "action", name: "Email Team", config: {}, order: 2 },
      ],
      createdAt: "2023-09-15T14:00:00Z",
      updatedAt: "2023-10-02T09:00:00Z",
      status: "inactive",
    },
  ];

  return NextResponse.json(data, { status: 200 });
}

export async function POST(request: NextRequest) {
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId, name, description, steps, status } = body;

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mock response (replace with real DB logic)
  const newWorkflow = {
    id: Date.now().toString(),
    name,
    description,
    steps,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status,
  };

  return NextResponse.json(newWorkflow, { status: 201 });
}
