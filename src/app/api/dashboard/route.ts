import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { subDays } from "date-fns";

export async function GET(request: NextRequest) {
  const { user } = await validateRequest();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const last7Days = subDays(now, 7);
    const [
      workflowStats,
      taskStats,
      completedTasks,
      recentTasks,
      aiMessages,
      integrationStats,
      documentStats,
      upcomingEvents,
      automationStats,
      billingStats,
      teamStats,
      overdueTasks,
      recentActivity,
    ] = await Promise.all([
      // Workflow Stats
      prisma.workflow
        .aggregate({
          where: { userId: user.id },
          _count: { id: true },
        })
        .then(async (stats) => ({
          total: stats._count.id,
          active: await prisma.workflow.count({
            where: { userId: user.id, status: "ACTIVE" },
          }),
        })),

      // Task Stats
      prisma.task.aggregate({
        where: { userId: user.id },
        _count: { id: true },
      }),

      // Completed Tasks
      prisma.task.count({
        where: { userId: user.id, status: "completed" },
      }),

      // Recent Tasks with Assignee
      prisma.task.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          dueDate: true,
          user: { select: { fullName: true } },
        },
      }),

      // AI Messages
      prisma.message.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, content: true, sender: true, createdAt: true },
      }),

      // Integration Stats
      prisma.integration
        .aggregate({
          where: { userId: user.id, status: "CONNECTED" },
          _count: { id: true },
        })
        .then(async (stats) => ({
          connected: stats._count.id,
          recent: await prisma.integration.findMany({
            where: { userId: user.id },
            orderBy: { connectedAt: "desc" },
            take: 3,
            select: { name: true, status: true, connectedAt: true },
          }),
        })),

      // Document Stats
      prisma.document
        .aggregate({
          where: { userId: user.id },
          _count: { id: true },
        })
        .then(async (stats) => ({
          total: stats._count.id,
          recent: await prisma.document.findFirst({
            where: { userId: user.id },
            orderBy: { updatedAt: "desc" },
            select: { title: true, updatedAt: true },
          }),
        })),

      // Upcoming Events
      prisma.event.findMany({
        where: { userId: user.id, start: { gte: now } },
        orderBy: { start: "asc" },
        take: 5,
        select: {
          id: true,
          title: true,
          start: true,
          task: { select: { id: true, title: true } },
        },
      }),

      // Automation Stats
      prisma.automation
        .aggregate({
          where: { userId: user.id },
          _count: { id: true },
        })
        .then(async (stats) => ({
          total: stats._count.id,
          active: await prisma.automation.count({
            where: { userId: user.id, status: "ACTIVE" },
          }),
          recent: await prisma.automation.findFirst({
            where: { userId: user.id },
            orderBy: { updatedAt: "desc" },
            select: { title: true, status: true, updatedAt: true },
          }),
        })),

      // Billing Stats
      prisma.billing.findFirst({
        where: { userId: user.id },
        select: {
          plan: true,
          billingDate: true,
          amount: true,
          invoices: {
            orderBy: { issuedAt: "desc" },
            take: 1,
            select: { id: true, amount: true, status: true, issuedAt: true },
          },
        },
      }),

      // Team Stats
      prisma.teamMember
        .aggregate({
          where: { userId: user.id },
          _count: { id: true },
        })
        .then(async (stats) => ({
          total: stats._count.id,
          active: await prisma.teamMember.count({
            where: { userId: user.id, status: "active" },
          }),
          recent: await prisma.teamMember.findMany({
            where: { userId: user.id },
            orderBy: { invitedAt: "desc" },
            take: 5,
            select: { id: true, email: true, role: true, status: true },
          }),
        })),

      // Overdue Tasks
      prisma.task.count({
        where: {
          userId: user.id,
          dueDate: { lt: now },
          status: { not: "completed" },
        },
      }),

      // Recent Activity (from UserActivityLog if available, fallback to tasks/documents)
      prisma.userActivityLog
        .findMany({
          where: { userId: user.id, timestamp: { gte: last7Days } },
          orderBy: { timestamp: "desc" },
          take: 5,
          select: {
            id: true,
            action: true,
            entityType: true,
            entityId: true,
            timestamp: true,
          },
        })
        .catch(async () => {
          // Fallback if UserActivityLog is not populated
          const tasks = await prisma.task.findMany({
            where: { userId: user.id, createdAt: { gte: last7Days } },
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
              id: true,
              title: true,
              createdAt: true,
            },
          });
          return tasks.map((task) => ({
            id: task.id,
            action: `Created task: ${task.title}`,
            entityType: "task",
            entityId: task.id,
            timestamp: task.createdAt,
          }));
        }),
    ]);

    const taskCompletionRate = taskStats._count.id
      ? (completedTasks / taskStats._count.id) * 100
      : 0;

    const data = {
      overview: {
        workflows: {
          total: workflowStats.total,
          active: workflowStats.active,
        },
        tasks: {
          total: taskStats._count.id,
          completed: completedTasks,
          overdue: overdueTasks,
          completionRate: taskCompletionRate.toFixed(1),
          recent: recentTasks.map((task) => ({
            id: task.id,
            title: task.title,
            status: task.status,
            dueDate: task.dueDate?.toISOString(),
            assignedTo: task.user.fullName,
          })),
        },
        team: {
          totalMembers: teamStats.total,
          activeMembers: teamStats.active,
          recentMembers: teamStats.recent.map((m) => ({
            id: m.id,
            email: m.email,
            role: m.role,
            status: m.status,
          })),
        },
        billing: {
          plan: billingStats?.plan || "Free",
          nextBillingDate: billingStats?.billingDate?.toISOString() || null,
          amountDue: billingStats?.amount || 0,
          recentInvoice: billingStats?.invoices[0]
            ? {
                id: billingStats.invoices[0].id,
                amount: billingStats.invoices[0].amount,
                status: billingStats.invoices[0].status,
                issuedAt: billingStats.invoices[0].issuedAt.toISOString(),
              }
            : null,
        },
      },
      aiAssistant: {
        recentMessages: aiMessages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          timestamp: msg.createdAt.toISOString(),
        })),
      },
      integrations: {
        connected: integrationStats.connected,
        recent: integrationStats.recent.map((i) => ({
          name: i.name,
          status: i.status,
          connectedAt: i.connectedAt.toISOString(),
        })),
      },
      documents: {
        total: documentStats.total,
        recent: documentStats.recent
          ? {
              title: documentStats.recent.title,
              updatedAt: documentStats.recent.updatedAt.toISOString(),
            }
          : null,
      },
      calendar: {
        upcomingEvents: upcomingEvents.map((event) => ({
          id: event.id,
          title: event.title,
          start: event.start.toISOString(),
          linkedTask: event.task
            ? { id: event.task.id, title: event.task.title }
            : null,
        })),
      },
      automations: {
        total: automationStats.total,
        active: automationStats.active,
        recent: automationStats.recent
          ? {
              title: automationStats.recent.title,
              status: automationStats.recent.status,
              updatedAt: automationStats.recent.updatedAt.toISOString(),
            }
          : null,
      },
      activity: recentActivity.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        timestamp: log.timestamp.toISOString(),
      })),
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
