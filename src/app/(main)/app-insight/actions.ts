"use server";

import { AppInsightsData } from "./types/DashboardDataTypes";

export async function fetchAppInsights(
  userId?: string
): Promise<AppInsightsData> {
  if (!userId) throw new Error("User ID is required");

  const response = await fetch(`/api/app-insights?userId=${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Failed to fetch app insights");
  return response.json();
}
