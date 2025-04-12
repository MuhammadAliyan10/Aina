// src/app/(main)/dashboard/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { DashboardData } from "./types";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export async function fetchDashboardData(
  userId?: string
): Promise<DashboardData> {
  if (!userId) throw new Error("User ID is required");

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
    }), // Add Activity model if needed
  ]);

  const dashboardData: DashboardData = {
    overview: {
      workflows: {
        total: workflows.length,
        active: workflows.filter((w) => w.status === "ACTIVE").length,
      },
      tasks: {
        total: tasks.length,
        completed: tasks.filter((t) => t.status === "completed").length,
        overdue: tasks.filter(
          (t) =>
            t.dueDate &&
            new Date(t.dueDate) < new Date() &&
            t.status !== "completed"
        ).length,
        completionRate: (
          (tasks.filter((t) => t.status === "completed").length /
            tasks.length) *
            100 || 0
        ).toFixed(1),
        recent: tasks.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          dueDate: t.dueDate?.toISOString() || null,
          assignedTo: t.userId,
        })),
      },
      team: {
        totalMembers: teamMembers.length,
        activeMembers: teamMembers.filter((m) => m.status === "active").length,
        recentMembers: teamMembers.map((m) => ({
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
      recentMessages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        sender: m.sender,
        timestamp: m.createdAt.toISOString(),
      })),
    },
    integrations: {
      connected: integrations.filter((i) => i.status === "CONNECTED").length,
      recent: integrations.map((i) => ({
        name: i.name,
        status: i.status,
        connectedAt: i.connectedAt ? i.connectedAt.toISOString() : "",
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
      upcomingEvents: events.map((e) => ({
        id: e.id,
        title: e.title,
        start: e.start.toISOString(),
        linkedTask: e.task ? { id: e.task.id, title: e.task.title } : null,
      })),
    },
    automations: {
      total: automations.length,
      active: automations.filter((a) => a.status === "ACTIVE").length,
      recent: automations[0]
        ? {
            title: automations[0].title,
            status: automations[0].status,
            updatedAt: automations[0].updatedAt.toISOString(),
          }
        : null,
    },
    activity: activity.map((a) => ({
      id: a.id,
      action: a.action,
      entityType: a.entityType,
      entityId: a.entityId,
      timestamp: a.timestamp.toISOString(),
    })),
  };

  return dashboardData;
}

export async function createTask(
  title: string,
  userId?: string
): Promise<void> {
  if (!userId) throw new Error("User ID is required");
  if (!title) throw new Error("Task title is required");

  await prisma.task.create({
    data: {
      title,
      status: "pending",
      dueDate: new Date(),
      userId,
      nodeId: null, // Adjust if linked to a workflow node
    },
  });
}

export async function inviteTeamMember(
  email: string,
  userId?: string
): Promise<void> {
  if (!userId) throw new Error("User ID is required");
  if (!email) throw new Error("Email is required");

  await prisma.teamMember.create({
    data: {
      userId,
      email,
      role: "member",
      status: "invited",
      invitedAt: new Date(),
    },
  });
}
