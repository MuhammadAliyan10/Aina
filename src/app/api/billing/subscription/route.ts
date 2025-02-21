// src/app/api/billing/subscription/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";

export async function GET(request: NextRequest) {
  const { user } = await validateRequest();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mock data (replace with real DB query)
  const data = {
    plan: "Pro",
    status: "active",
    nextBillingDate: "2024-11-01",
    amount: 29.99,
  };

  return NextResponse.json(data, { status: 200 });
}
