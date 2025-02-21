// src/app/api/billing/subscription/route.ts
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
    const billing = await prisma.billing.findFirst({
      where: { userId: user.id },
      select: {
        plan: true,
        status: true,
        amount: true,
        billingDate: true,
      },
    });

    const data = billing || {
      plan: "Free",
      status: "inactive",
      billingDate: null,
      amount: 0,
    };

    return NextResponse.json(
      {
        ...data,
        nextBillingDate: data.billingDate?.toISOString() || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
