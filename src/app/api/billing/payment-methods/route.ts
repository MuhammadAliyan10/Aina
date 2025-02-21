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
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { billing: { userId: user.id } },
      select: { id: true, type: true, lastFour: true, expiry: true },
    });

    return NextResponse.json(paymentMethods, { status: 200 });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId, cardNumber, expiry } = body;

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!cardNumber || !expiry) {
    return NextResponse.json(
      { error: "Card number and expiry are required" },
      { status: 400 }
    );
  }

  try {
    const billing = await prisma.billing.findFirst({
      where: { userId: user.id },
    });
    if (!billing) {
      return NextResponse.json(
        { error: "No billing record found" },
        { status: 404 }
      );
    }

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        billingId: billing.id,
        type: "credit_card",
        lastFour: cardNumber.slice(-4),
        expiry,
      },
    });

    return NextResponse.json(paymentMethod, { status: 201 });
  } catch (error) {
    console.error("Error adding payment method:", error);
    return NextResponse.json(
      { error: "Failed to add payment method" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId, id } = body; // Move id from params to body

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    await prisma.paymentMethod.delete({
      where: { id, billing: { userId: user.id } },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    return NextResponse.json(
      { error: "Failed to delete payment method" },
      { status: 500 }
    );
  }
}
