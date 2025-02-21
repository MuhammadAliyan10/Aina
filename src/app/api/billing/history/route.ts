// src/app/api/billing/history/route.ts
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
  const data = [
    {
      id: "1",
      date: "2023-10-01",
      description: "Pro Plan - October",
      amount: 29.99,
      status: "paid",
    },
    {
      id: "2",
      date: "2023-09-01",
      description: "Pro Plan - September",
      amount: 29.99,
      status: "paid",
    },
    {
      id: "3",
      date: "2023-08-01",
      description: "Pro Plan - August",
      amount: 29.99,
      status: "pending",
    },
  ];

  return NextResponse.json(data, { status: 200 });
}
