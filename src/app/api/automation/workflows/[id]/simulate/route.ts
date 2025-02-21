import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

// Define the params type
type RouteParams = {
  id: string;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> } // Wrap params in Promise
) {
  const resolvedParams = await params; // Await the Promise
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId } = body;

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!resolvedParams.id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    const automation = await prisma.automation.findUnique({
      where: { id: resolvedParams.id, userId: user.id },
    });
    if (!automation) {
      return NextResponse.json(
        { error: "Automation not found" },
        { status: 404 }
      );
    }

    const execution = await prisma.execution.create({
      data: {
        automationId: automation.id,
        success: true, // Simulated success
        result: `Simulated execution of ${automation.title}`,
      },
    });

    const result = {
      id: execution.id,
      message: execution.result,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error simulating automation:", error);
    return NextResponse.json(
      { error: "Failed to simulate automation" },
      { status: 500 }
    );
  }
}
