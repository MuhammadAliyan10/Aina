// src/app/api/automation/workflows/route.ts
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
    const automations = await prisma.automation.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        status: true,
      },
    });

    const data = automations.map((automation) => ({
      id: automation.id,
      name: automation.title,
      description: automation.description,
      steps: [], // No direct steps in Automation; extend if needed
      createdAt: automation.createdAt.toISOString(),
      updatedAt: automation.updatedAt.toISOString(),
      status: automation.status,
    }));

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching automations:", error);
    return NextResponse.json(
      { error: "Failed to fetch automations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId, name, description, steps, status } = body;

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  try {
    const automation = await prisma.automation.create({
      data: {
        userId: user.id,
        title: name,
        description,
        automationUrl: "default-url", // Placeholder; adjust based on requirements
        type: "custom", // Placeholder; specify type as needed
        process: "Automated process",
        executeAt: new Date(),
        status: status || "PENDING",
      },
    });

    const newWorkflow = {
      id: automation.id,
      name: automation.title,
      description: automation.description,
      steps: [], // No steps in Automation model; extend if needed
      createdAt: automation.createdAt.toISOString(),
      updatedAt: automation.updatedAt.toISOString(),
      status: automation.status,
    };

    return NextResponse.json(newWorkflow, { status: 201 });
  } catch (error) {
    console.error("Error creating automation:", error);
    return NextResponse.json(
      { error: "Failed to create automation" },
      { status: 500 }
    );
  }
}
