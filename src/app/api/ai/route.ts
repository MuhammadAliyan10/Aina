// src/app/api/analytics/ai/route.ts
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
    const aiUsage = await prisma.message.groupBy({
      by: ["sender"],
      where: {
        userId: user.id,
        createdAt: { gte: startDate },
      },
      _count: { id: true },
    });

    const data = aiUsage.map((entry) => ({
      category: entry.sender === "user" ? "User Queries" : "AI Responses",
      value: entry._count.id,
    }));

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching AI usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI usage" },
      { status: 500 }
    );
  }
}
