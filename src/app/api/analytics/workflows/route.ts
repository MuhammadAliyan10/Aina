// src/app/api/analytics/workflows/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { user } = await validateRequest();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const range = searchParams.get("range") || "month";

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startDate = new Date();
  if (range === "week") startDate.setDate(startDate.getDate() - 7);
  else if (range === "month") startDate.setMonth(startDate.getMonth() - 1);
  else if (range === "year") startDate.setFullYear(startDate.getFullYear() - 1);

  try {
    const executionData = await prisma.execution.groupBy({
      by: ["automationId"],
      where: {
        automation: { userId: user.id },
        executedAt: { gte: startDate },
      },
      _count: { id: true },
      _sum: { success: true },
    });

    const data = await Promise.all(
      executionData.map(async (entry) => {
        const automation = await prisma.automation.findUnique({
          where: { id: entry.automationId },
          select: { title: true },
        });
        return {
          name: automation?.title || "Unknown",
          executions: entry._count.id,
          successRate: entry._count.id
            ? ((entry._sum.success || 0) / entry._count.id) * 100
            : 0,
        };
      })
    );

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching workflow analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch workflow analytics" },
      { status: 500 }
    );
  }
}
