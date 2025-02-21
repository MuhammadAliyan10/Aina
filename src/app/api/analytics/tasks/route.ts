// src/app/api/analytics/tasks/route.ts
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
    const taskData = await prisma.task.groupBy({
      by: ["createdAt"],
      where: {
        userId: user.id,
        createdAt: { gte: startDate },
      },
      _count: { id: true },
      _sum: { status: { equals: "completed" } },
    });

    const data = taskData.map((entry) => ({
      date: entry.createdAt.toISOString().split("T")[0],
      completed: entry._sum.status || 0,
      pending: entry._count.id - (entry._sum.status || 0),
    }));

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching task analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch task analytics" },
      { status: 500 }
    );
  }
}
