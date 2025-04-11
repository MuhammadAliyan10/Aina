// src/app/api/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DashboardData } from "../../(main)/dashboard/types"; // Adjust path as needed
import { validateRequest } from "@/auth";

export async function GET(request: NextRequest) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  try {
    // Fetch all required data in parallel
    const [
      workflows,
      tasks,
      teamMembers,
      billing,
      messages,
      integrations,
      documents,
      events,
      automations,
      activity,
    ] = await Promise.all([
      prisma.workflow.findMany({ where: { userId } }),
      prisma.task.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.teamMember.findMany({
        where: { userId },
        orderBy: { invitedAt: "desc" },
        take: 5,
      }),
      prisma.billing.findFirst({
        where: { userId },
        include: { invoices: { take: 1, orderBy: { issuedAt: "desc" } } },
      }),
      prisma.message.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.integration.findMany({
        where: { userId },
        orderBy: { connectedAt: "desc" },
        take: 5,
      }),
      prisma.document.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 1,
      }),
      prisma.event.findMany({
        where: { userId, start: { gte: new Date() } },
        orderBy: { start: "asc" },
        take: 5,
        include: { task: true },
      }),
      prisma.automation.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 1,
      }),
      prisma.activity.findMany({
        where: { userId },
        orderBy: { timestamp: "desc" },
        take: 5,
      }), // Assuming an Activity model
    ]);

    // Map data to DashboardData structure
    const dashboardData: DashboardData = {
      overview: {
        workflows: {
          total: workflows.length,
          active: workflows.filter((w: any) => w.status === "ACTIVE").length,
        },
        tasks: {
          total: tasks.length,
          completed: tasks.filter((t: any) => t.status === "completed").length,
          overdue: tasks.filter(
            (t: any) =>
              t.dueDate &&
              new Date(t.dueDate) < new Date() &&
              t.status !== "completed"
          ).length,
          completionRate: (
            (tasks.filter((t: any) => t.status === "completed").length /
              tasks.length) *
              100 || 0
          ).toFixed(1),
          recent: tasks.map((t: any) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            dueDate: t.dueDate?.toISOString() || null,
            assignedTo: t.userId, // Adjust if you have an assigned user field
          })),
        },
        team: {
          totalMembers: teamMembers.length,
          activeMembers: teamMembers.filter((m: any) => m.status === "active")
            .length,
          recentMembers: teamMembers.map((m: any) => ({
            id: m.id,
            email: m.email,
            role: m.role,
            status: m.status,
          })),
        },
        billing: {
          plan: billing?.plan || "Free",
          nextBillingDate: billing?.billingDate?.toISOString() || null,
          amountDue: billing?.amount || 0,
          recentInvoice: billing?.invoices[0]
            ? {
                id: billing.invoices[0].id,
                amount: billing.invoices[0].amount,
                status: billing.invoices[0].status,
                issuedAt: billing.invoices[0].issuedAt.toISOString(),
              }
            : null,
        },
      },
      aiAssistant: {
        recentMessages: messages.map((m: any) => ({
          id: m.id,
          content: m.content,
          sender: m.sender,
          timestamp: m.createdAt.toISOString(),
        })),
      },
      integrations: {
        connected: integrations.filter((i: any) => i.status === "CONNECTED")
          .length,
        recent: integrations.map((i: any) => ({
          name: i.name,
          status: i.status,
          connectedAt: i.connectedAt.toISOString(),
        })),
      },
      documents: {
        total: documents.length,
        recent: documents[0]
          ? {
              title: documents[0].title,
              updatedAt: documents[0].updatedAt.toISOString(),
            }
          : null,
      },
      calendar: {
        upcomingEvents: events.map((e: any) => ({
          id: e.id,
          title: e.title,
          start: e.start.toISOString(),
          linkedTask: e.task ? { id: e.task.id, title: e.task.title } : null,
        })),
      },
      automations: {
        total: automations.length,
        active: automations.filter((a: any) => a.status === "ACTIVE").length,
        recent: automations[0]
          ? {
              title: automations[0].title,
              status: automations[0].status,
              updatedAt: automations[0].updatedAt.toISOString(),
            }
          : null,
      },
      activity: activity.map((a: any) => ({
        id: a.id,
        action: a.action,
        entityType: a.entityType,
        entityId: a.entityId,
        timestamp: a.timestamp.toISOString(),
      })),
    };

    return NextResponse.json(dashboardData, { status: 200 });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
