// src/app/api/app-insights/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { subDays } from "date-fns";

export async function GET(request: NextRequest) {
  const { user } = await validateRequest();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const timeRange =
    (searchParams.get("timeRange") as "7d" | "30d" | "all") || "7d";

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const rangeStart =
    timeRange === "7d"
      ? subDays(now, 7)
      : timeRange === "30d"
      ? subDays(now, 30)
      : new Date(0);

  try {
    const [
      userStats,
      taskStats,
      automationStats,
      workflowStats,
      integrationStats,
      documentStats,
      eventStats,
      activityLogs,
      systemMetrics,
      analyticsEvents,
      teamStats,
      billingStats,
    ] = await Promise.all([
      Promise.resolve().then(async () => ({
        totalUsers: await prisma.user.count(),
        activeUsers: await prisma.user.count({
          where: { lastLogin: { gte: rangeStart } },
        }),
        recentLogins: await prisma.userActivityLog.count({
          where: { userId, action: "login", timestamp: { gte: rangeStart } },
        }),
      })),

      prisma.task
        .aggregate({
          where: { userId },
          _count: { id: true },
        })
        .then(async (stats) => ({
          totalTasks: stats._count.id,
          completedTasks: await prisma.task.count({
            where: { userId, status: "completed" },
          }),
          overdueTasks: await prisma.task.count({
            where: {
              userId,
              dueDate: { lt: now },
              status: { not: "completed" },
            },
          }),
          avgCompletionTime: await prisma.task
            .findMany({
              where: {
                userId,
                status: "completed",
                updatedAt: { gte: rangeStart },
              },
              select: {
                createdAt: true,
                updatedAt: true,
              },
            })
            .then((tasks) => {
              if (tasks.length === 0) return "0";
              const totalHours = tasks.reduce((sum, task) => {
                const diffMs =
                  new Date(task.updatedAt).getTime() -
                  new Date(task.createdAt).getTime();
                return sum + diffMs / 3600000; // Convert milliseconds to hours
              }, 0);
              return (totalHours / tasks.length).toFixed(2); // Average in hours
            }),
        })),

      prisma.automation
        .aggregate({
          where: { userId },
          _count: { id: true },
        })
        .then(async (stats) => {
          const totalExecutions = await prisma.execution.count({
            where: {
              automation: { userId },
              executedAt: { gte: rangeStart },
            },
          });
          const successfulExecutions = await prisma.execution.count({
            where: {
              automation: { userId },
              executedAt: { gte: rangeStart },
              success: true,
            },
          });
          const avgSuccessRate =
            totalExecutions > 0
              ? ((successfulExecutions / totalExecutions) * 100).toFixed(2)
              : "0";

          return {
            totalAutomations: stats._count.id,
            activeAutomations: await prisma.automation.count({
              where: { userId, status: "ACTIVE" },
            }),
            avgSuccessRate,
            recentExecutions: await prisma.execution.findMany({
              where: {
                automation: { userId },
                executedAt: { gte: rangeStart },
              },
              orderBy: { executedAt: "desc" },
              take: 5,
              select: {
                id: true,
                executedAt: true,
                success: true,
                result: true,
              },
            }),
          };
        }),

      prisma.workflow
        .aggregate({
          where: { userId },
          _count: { id: true },
        })
        .then(async (stats) => ({
          totalWorkflows: stats._count.id,
          activeWorkflows: await prisma.workflow.count({
            where: { userId, status: "ACTIVE" },
          }),
        })),

      prisma.integration
        .count({
          where: { userId, status: "CONNECTED" },
        })
        .then(async (count) => ({
          connectedIntegrations: count,
          recentIntegrations: await prisma.integration.findMany({
            where: { userId, connectedAt: { gte: rangeStart } },
            orderBy: { connectedAt: "desc" },
            take: 3,
            select: { name: true, connectedAt: true, status: true },
          }),
        })),

      prisma.document
        .aggregate({
          where: { userId },
          _count: { id: true },
        })
        .then(async (stats) => ({
          totalDocuments: stats._count.id,
          recentDocument: await prisma.document.findFirst({
            where: { userId, updatedAt: { gte: rangeStart } },
            orderBy: { updatedAt: "desc" },
            select: { title: true, updatedAt: true },
          }),
        })),

      prisma.event
        .aggregate({
          where: { userId },
          _count: { id: true },
        })
        .then(async (stats) => ({
          totalEvents: stats._count.id,
          upcomingEvents: await prisma.event.count({
            where: { userId, start: { gte: now } },
          }),
        })),

      prisma.userActivityLog.findMany({
        where: { userId, timestamp: { gte: rangeStart } },
        orderBy: { timestamp: "desc" },
        take: 10,
        select: {
          action: true,
          entityType: true,
          entityId: true,
          timestamp: true,
        },
      }),

      prisma.systemMetric
        .findMany({
          where: { recordedAt: { gte: rangeStart } },
          orderBy: { recordedAt: "desc" },
          take: 10,
          select: { metricType: true, value: true, recordedAt: true },
        })
        .then((metrics) => ({
          avgResponseTime: (
            metrics
              .filter((m) => m.metricType === "api_response_time")
              .reduce((sum, m) => sum + m.value, 0) /
            (metrics.filter((m) => m.metricType === "api_response_time")
              .length || 1)
          ).toFixed(2),
          uptime: (
            metrics
              .filter((m) => m.metricType === "uptime")
              .reduce((sum, m) => sum + m.value, 0) /
            (metrics.filter((m) => m.metricType === "uptime").length || 1)
          ).toFixed(2),
          recentMetrics: metrics,
        })),

      prisma.analyticsEvent
        .groupBy({
          by: ["eventType"],
          where: { userId, timestamp: { gte: rangeStart } },
          _count: { eventType: true },
        })
        .then((events) => ({
          topEvents: events
            .sort((a, b) => b._count.eventType - a._count.eventType)
            .slice(0, 5),
        })),

      prisma.teamMember
        .aggregate({
          where: { userId },
          _count: { id: true },
        })
        .then(async (stats) => ({
          totalMembers: stats._count.id,
          activeMembers: await prisma.teamMember.count({
            where: { userId, status: "active" },
          }),
        })),

      prisma.billing
        .findFirst({
          where: { userId },
          select: { plan: true, amount: true, billingDate: true },
        })
        .then(async (billing) => ({
          plan: billing?.plan || "Free",
          amount: billing?.amount || 0,
          nextBillingDate: billing?.billingDate,
          totalInvoices: await prisma.invoice.count({
            where: { billing: { userId } },
          }),
        })),
    ]);

    const data = {
      userEngagement: {
        totalUsers: userStats.totalUsers,
        activeUsers: userStats.activeUsers,
        recentLogins: userStats.recentLogins,
      },
      tasks: {
        totalTasks: taskStats.totalTasks,
        completedTasks: taskStats.completedTasks,
        overdueTasks: taskStats.overdueTasks,
        avgCompletionTime: taskStats.avgCompletionTime,
      },
      automations: {
        totalAutomations: automationStats.totalAutomations,
        activeAutomations: automationStats.activeAutomations,
        avgSuccessRate: automationStats.avgSuccessRate,
        recentExecutions: automationStats.recentExecutions.map((e) => ({
          id: e.id,
          executedAt: e.executedAt.toISOString(),
          success: e.success,
          result: e.result,
        })),
      },
      workflows: {
        totalWorkflows: workflowStats.totalWorkflows,
        activeWorkflows: workflowStats.activeWorkflows,
      },
      integrations: {
        connectedIntegrations: integrationStats.connectedIntegrations,
        recentIntegrations: integrationStats.recentIntegrations.map((i) => ({
          name: i.name,
          connectedAt: i.connectedAt.toISOString(),
          status: i.status,
        })),
      },
      documents: {
        totalDocuments: documentStats.totalDocuments,
        recentDocument: documentStats.recentDocument
          ? {
              title: documentStats.recentDocument.title,
              updatedAt: documentStats.recentDocument.updatedAt.toISOString(),
            }
          : null,
      },
      events: {
        totalEvents: eventStats.totalEvents,
        upcomingEvents: eventStats.upcomingEvents,
      },
      activity: activityLogs.map((log) => ({
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        timestamp: log.timestamp.toISOString(),
      })),
      systemHealth: {
        avgResponseTime: systemMetrics.avgResponseTime,
        uptime: systemMetrics.uptime,
        recentMetrics: systemMetrics.recentMetrics.map((m) => ({
          metricType: m.metricType,
          value: m.value,
          recordedAt: m.recordedAt.toISOString(),
        })),
      },
      usagePatterns: {
        topEvents: analyticsEvents.topEvents.map((e) => ({
          eventType: e.eventType,
          count: e._count.eventType,
        })),
      },
      team: {
        totalMembers: teamStats.totalMembers,
        activeMembers: teamStats.activeMembers,
      },
      billing: {
        plan: billingStats.plan,
        amount: billingStats.amount,
        nextBillingDate: billingStats.nextBillingDate?.toISOString() || null,
        totalInvoices: billingStats.totalInvoices,
      },
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(
      "Error fetching app insights:",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      { error: "Failed to fetch app insights" },
      { status: 500 }
    );
  }
}
