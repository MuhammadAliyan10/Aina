import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

// Define the params type
type RouteParams = {
  id: string;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> } // Wrap params in Promise
) {
  const resolvedParams = await params; // Await the Promise
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId, title, description, status, dueDate } = body;

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!resolvedParams.id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    // Check if the task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: resolvedParams.id, userId: user.id },
    });
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const task = await prisma.task.update({
      where: { id: resolvedParams.id, userId: user.id },
      data: {
        title,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });

    const updatedTask = {
      id: task.id,
      title: task.title,
      description: task.description || "",
      status: task.status,
      dueDate: task.dueDate?.toISOString() || null,
      updatedAt: task.updatedAt.toISOString(),
    };

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    // Check if the task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: resolvedParams.id, userId: user.id },
    });
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id: resolvedParams.id, userId: user.id },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
