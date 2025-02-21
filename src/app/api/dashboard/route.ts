// src/app/api/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";

export async function GET(request: NextRequest) {
  const { user } = await validateRequest();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mock data (replace with real aggregated queries from other endpoints)
  const data = {
    analytics: {
      workflowExecutions: 120,
      taskCompletionRate: 85.5,
      aiUsage: 15,
    },
    billing: {
      plan: "Pro",
      nextBillingDate: "2024-11-01",
      amountDue: 29.99,
    },
    team: {
      totalMembers: 5,
      activeMembers: 4,
    },
    aiAssistant: {
      recentMessages: [
        {
          content: "Can you help me?",
          sender: "user",
          timestamp: "2023-10-05T10:00:00Z",
        },
        {
          content: "Of course!",
          sender: "ai",
          timestamp: "2023-10-05T10:01:00Z",
        },
      ],
    },
    integrations: {
      connectedCount: 2,
    },
    documents: {
      totalDocs: 10,
      recentDoc: { title: "Meeting Notes", updatedAt: "2023-10-02T09:15:00Z" },
    },
    tasks: {
      pendingTasks: 8,
      completedTasks: 15,
      overdueTasks: 2,
    },
    calendar: {
      upcomingEvents: [
        { title: "Team Meeting", start: "2023-10-05T10:00:00Z" },
        { title: "Project Review", start: "2023-10-06T14:00:00Z" },
      ],
    },
    automation: {
      activeWorkflows: 3,
      recentWorkflow: { name: "Email Automation", status: "active" },
    },
  };

  return NextResponse.json(data, { status: 200 });
}
