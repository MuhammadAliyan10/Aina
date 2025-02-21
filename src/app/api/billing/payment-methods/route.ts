// src/app/api/billing/payment-methods/route.ts
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
    { id: "1", type: "credit_card", lastFour: "1234", expiry: "12/25" },
    { id: "2", type: "paypal", lastFour: "N/A", expiry: "N/A" },
  ];

  return NextResponse.json(data, { status: 200 });
}

export async function POST(request: NextRequest) {
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId, cardNumber, expiry } = body;

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mock response (replace with real DB logic)
  const newMethod = {
    id: Date.now().toString(), // Simple ID generation for demo
    type: "credit_card",
    lastFour: cardNumber.slice(-4),
    expiry,
  };

  return NextResponse.json(newMethod, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId } = body;

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mock success (replace with real DB deletion)
  return NextResponse.json({ success: true }, { status: 200 });
}
