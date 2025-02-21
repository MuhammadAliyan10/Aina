// src/app/api/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { user } = await validateRequest();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      workflowCount,
      taskStats,
      completedTasks,
      aiMessages,
      integrationCount,
      documentStats,
      upcomingEvents,
      automationStats,
      billing,
      teamStats,
      overdueTasks,
    ] = await Promise.all([
      prisma.workflow.count({ where: { userId: user.id } }),

      prisma.task.aggregate({
        where: { userId: user.id },
        _count: { id: true },
      }),

      prisma.task.count({
        where: { userId: user.id, status: "completed" },
      }),

      prisma.message.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { content: true, sender: true, createdAt: true },
      }),

      prisma.integration.count({
        where: { userId: user.id, status: "CONNECTED" },
      }),

      prisma.document
        .findFirst({
          where: { userId: user.id },
          orderBy: { updatedAt: "desc" },
          select: { title: true, updatedAt: true },
        })
        .then(async (doc) => ({
          _count: await prisma.document.count({ where: { userId: user.id } }),
          doc,
        })),

      prisma.event.findMany({
        where: { userId: user.id, start: { gte: new Date() } },
        orderBy: { start: "asc" },
        take: 5,
        select: { title: true, start: true },
      }),

      prisma.automation
        .findFirst({
          where: { userId: user.id },
          orderBy: { updatedAt: "desc" },
          select: { title: true, status: true },
        })
        .then(async (automation) => ({
          _count: await prisma.automation.count({ where: { userId: user.id } }),
          automation,
        })),

      prisma.billing.findFirst({
        where: { userId: user.id },
        select: { plan: true, billingDate: true, amount: true },
      }),

      prisma.teamMember.aggregate({
        where: { userId: user.id },
        _count: { id: true },
      }),

      prisma.task.count({
        where: {
          userId: user.id,
          dueDate: { lt: new Date() },
          status: { not: "completed" },
        },
      }),
    ]);

    const taskCompletionRate = taskStats._count.id
      ? (completedTasks / taskStats._count.id) * 100
      : 0;

    const data = {
      analytics: {
        workflowExecutions: workflowCount,
        taskCompletionRate,
        aiUsage: aiMessages.length,
      },
      billing: {
        plan: billing?.plan || "Free",
        nextBillingDate: billing?.billingDate?.toISOString() || null,
        amountDue: billing?.amount || 0,
      },
      team: {
        totalMembers: teamStats._count.id,
        activeMembers: teamStats._count.id, // No active status field, assuming all are active
      },
      aiAssistant: {
        recentMessages: aiMessages.map((msg) => ({
          content: msg.content,
          sender: msg.sender,
          timestamp: msg.createdAt.toISOString(),
        })),
      },
      integrations: { connectedCount: integrationCount },
      documents: {
        totalDocs: documentStats._count,
        recentDoc: documentStats.doc
          ? {
              title: documentStats.doc.title,
              updatedAt: documentStats.doc.updatedAt.toISOString(),
            }
          : null,
      },
      tasks: {
        pendingTasks: taskStats._count.id - completedTasks,
        completedTasks,
        overdueTasks,
      },
      calendar: {
        upcomingEvents: upcomingEvents.map((event) => ({
          title: event.title,
          start: event.start.toISOString(),
        })),
      },
      automation: {
        activeWorkflows: automationStats._count,
        recentWorkflow: automationStats.automation
          ? {
              name: automationStats.automation.title,
              status: automationStats.automation.status,
            }
          : null,
      },
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
