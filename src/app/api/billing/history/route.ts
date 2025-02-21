// src/app/api/billing/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { user } = await validateRequest();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const invoices = await prisma.invoice.findMany({
      where: { billing: { userId: user.id } },
      select: {
        id: true,
        issuedAt: true,
        amount: true,
        status: true,
      },
      orderBy: { issuedAt: "desc" },
    });

    const data = invoices.map((invoice) => ({
      id: invoice.id,
      date: invoice.issuedAt.toISOString().split("T")[0],
      description: `Plan Billing - ${invoice.issuedAt.toLocaleString(
        "default",
        { month: "long" }
      )}`,
      amount: invoice.amount,
      status: invoice.status,
    }));

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching billing history:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing history" },
      { status: 500 }
    );
  }
}
