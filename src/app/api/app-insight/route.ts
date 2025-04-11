import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { subDays, startOfDay, endOfDay } from "date-fns";

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
      // User Engagement
      prisma.user
        .aggregate({
          where: { id: user.id },
          _count: { id: true },
        })
        .then(async () => ({
          totalUsers: await prisma.user.count(),
          activeUsers: await prisma.user.count({
            where: { lastLogin: { gte: last7Days } },
          }),
          recentLogins: await prisma.userActivityLog.count({
            where: {
              userId: user.id,
              action: "login",
              timestamp: { gte: last7Days },
            },
          }),
        })),

      // Task Analytics
      prisma.task
        .aggregate({
          where: { userId: user.id },
          _count: { id: true },
          _avg: { createdAt: true },
        })
        .then(async (stats) => ({
          totalTasks: stats._count.id,
          completedTasks: await prisma.task.count({
            where: { userId: user.id, status: "completed" },
          }),
          overdueTasks: await prisma.task.count({
            where: {
              userId: user.id,
              dueDate: { lt: now },
              status: { not: "completed" },
            },
          }),
          avgCompletionTime: stats._avg.createdAt
            ? (now.getTime() - new Date(stats._avg.createdAt).getTime()) /
              3600000
            : 0, // hours
        })),

      // Automation Analytics
      prisma.automation
        .aggregate({
          where: { userId: user.id },
          _count: { id: true },
          _avg: { successRate: true },
        })
        .then(async (stats) => ({
          totalAutomations: stats._count.id,
          activeAutomations: await prisma.automation.count({
            where: { userId: user.id, status: "ACTIVE" },
          }),
          avgSuccessRate: stats._avg.successRate || 0,
          recentExecutions: await prisma.execution.findMany({
            where: { automation: { userId: user.id } },
            orderBy: { executedAt: "desc" },
            take: 5,
            select: { id: true, executedAt: true, success: true, result: true },
          }),
        })),

      // Workflow Analytics
      prisma.workflow
        .aggregate({
          where: { userId: user.id },
          _count: { id: true },
        })
        .then(async (stats) => ({
          totalWorkflows: stats._count.id,
          activeWorkflows: await prisma.workflow.count({
            where: { userId: user.id, status: "ACTIVE" },
          }),
        })),

      // Integration Analytics
      prisma.integration
        .count({
          where: { userId: user.id, status: "CONNECTED" },
        })
        .then(async (count) => ({
          connectedIntegrations: count,
          recentIntegrations: await prisma.integration.findMany({
            where: { userId: user.id },
            orderBy: { connectedAt: "desc" },
            take: 3,
            select: { name: true, connectedAt: true, status: true },
          }),
        })),

      // Document Analytics
      prisma.document
        .aggregate({
          where: { userId: user.id },
          _count: { id: true },
        })
        .then(async (stats) => ({
          totalDocuments: stats._count.id,
          recentDocument: await prisma.document.findFirst({
            where: { userId: user.id },
            orderBy: { updatedAt: "desc" },
            select: { title: true, updatedAt: true },
          }),
        })),

      // Event Analytics
      prisma.event
        .aggregate({
          where: { userId: user.id },
          _count: { id: true },
        })
        .then(async (stats) => ({
          totalEvents: stats._count.id,
          upcomingEvents: await prisma.event.count({
            where: { userId: user.id, start: { gte: now } },
          }),
        })),

      // Activity Logs
      prisma.userActivityLog.findMany({
        where: { userId: user.id, timestamp: { gte: last7Days } },
        orderBy: { timestamp: "desc" },
        take: 10,
        select: {
          action: true,
          entityType: true,
          entityId: true,
          timestamp: true,
        },
      }),

      // System Metrics
      prisma.systemMetric
        .findMany({
          where: { recordedAt: { gte: last7Days } },
          orderBy: { recordedAt: "desc" },
          take: 10,
          select: { metricType: true, value: true, recordedAt: true },
        })
        .then((metrics) => ({
          avgResponseTime:
            metrics
              .filter((m) => m.metricType === "api_response_time")
              .reduce((sum, m) => sum + m.value, 0) /
            (metrics.filter((m) => m.metricType === "api_response_time")
              .length || 1),
          uptime:
            metrics
              .filter((m) => m.metricType === "uptime")
              .reduce((sum, m) => sum + m.value, 0) /
            (metrics.filter((m) => m.metricType === "uptime").length || 1),
          recentMetrics: metrics,
        })),

      // Analytics Events
      prisma.analyticsEvent
        .groupBy({
          by: ["eventType"],
          where: { userId: user.id, timestamp: { gte: last7Days } },
          _count: { eventType: true },
        })
        .then((events) => ({
          topEvents: events
            .sort((a, b) => b._count.eventType - a._count.eventType)
            .slice(0, 5),
        })),

      // Team Analytics
      prisma.teamMember
        .aggregate({
          where: { userId: user.id },
          _count: { id: true },
        })
        .then(async (stats) => ({
          totalMembers: stats._count.id,
          activeMembers: await prisma.teamMember.count({
            where: { userId: user.id, status: "active" },
          }),
        })),

      // Billing Analytics
      prisma.billing
        .findFirst({
          where: { userId: user.id },
          select: { plan: true, amount: true, billingDate: true },
        })
        .then(async (billing) => ({
          plan: billing?.plan || "Free",
          amount: billing?.amount || 0,
          nextBillingDate: billing?.billingDate,
          totalInvoices: await prisma.invoice.count({
            where: { billing: { userId: user.id } },
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
        avgCompletionTime: taskStats.avgCompletionTime.toFixed(2),
      },
      automations: {
        totalAutomations: automationStats.totalAutomations,
        activeAutomations: automationStats.activeAutomations,
        avgSuccessRate: automationStats.avgSuccessRate.toFixed(2),
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
        avgResponseTime: systemMetrics.avgResponseTime.toFixed(2),
        uptime: systemMetrics.uptime.toFixed(2),
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
    console.error("Error fetching app insights:", error);
    return NextResponse.json(
      { error: "Failed to fetch app insights" },
      { status: 500 }
    );
  }
}
