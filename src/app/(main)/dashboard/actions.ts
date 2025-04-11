"use server";

import { DashboardData } from "./types";

export async function fetchDashboardData(
  userId?: string
): Promise<DashboardData> {
  if (!userId) throw new Error("User ID is required");

  const response = await fetch(`/api/dashboard?userId=${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Failed to fetch dashboard data");
  return response.json();
}

export async function createTask(
  title: string,
  userId?: string
): Promise<void> {
  if (!userId) throw new Error("User ID is required");
  if (!title) throw new Error("Task title is required");

  const response = await fetch(`/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      title,
      status: "pending",
      dueDate: new Date().toISOString(),
    }),
  });

  if (!response.ok) throw new Error("Failed to create task");
}

export async function inviteTeamMember(
  email: string,
  userId?: string
): Promise<void> {
  if (!userId) throw new Error("User ID is required");
  if (!email) throw new Error("Email is required");

  const response = await fetch(`/api/team/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, email, role: "member" }),
  });

  if (!response.ok) throw new Error("Failed to send invitation");
}
