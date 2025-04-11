import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

// GET: Fetch all tasks for a user
export async function GET(request: NextRequest) {
  const { user } = await validateRequest();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      include: {
        user: { select: { fullName: true } },
        node: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description || "",
      status: task.status,
      dueDate: task.dueDate?.toISOString() || null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      assignedTo: task.user.fullName,
      nodeName: task.node?.name || null,
      priority: task.priority || "medium",
      labels: task.labels || [],
    }));

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching tasks:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      userId,
    });
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST: Create a new task
export async function POST(request: NextRequest) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    console.error("Error parsing request body:", {
      message: error instanceof Error ? error.message : "Invalid JSON",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const {
    userId,
    title,
    description,
    dueDate,
    status,
    nodeId,
    priority,
    labels,
  } = body;

  if (user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!title || typeof title !== "string" || title.trim() === "") {
    return NextResponse.json(
      { error: "Title is required and must be a non-empty string" },
      { status: 400 }
    );
  }

  try {
    const taskData: any = {
      title: title.trim(),
      description: description || null,
      status: status || "pending",
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || "medium",
      labels: Array.isArray(labels) ? labels : [],
      user: { connect: { id: user.id } },
    };

    // Only include node connection if nodeId is provided and valid
    if (nodeId && typeof nodeId === "string") {
      const nodeExists = await prisma.node.findUnique({
        where: { id: nodeId },
      });
      if (!nodeExists) {
        return NextResponse.json(
          { error: "Invalid nodeId: Node does not exist" },
          { status: 400 }
        );
      }
      taskData.node = { connect: { id: nodeId } };
    }

    const task = await prisma.task.create({
      data: taskData,
    });

    const newTask = {
      id: task.id,
      title: task.title,
      description: task.description || "",
      status: task.status,
      dueDate: task.dueDate?.toISOString() || null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      assignedTo: user.fullName,
      nodeName: nodeId
        ? (await prisma.node.findUnique({ where: { id: nodeId } }))?.name ||
          null
        : null,
      priority: task.priority || "medium",
      labels: task.labels || [],
    };

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      body,
      userId,
    });
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

// PATCH: Update a task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    console.error("Error parsing request body:", {
      message: error instanceof Error ? error.message : "Invalid JSON",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const {
    userId,
    title,
    description,
    status,
    dueDate,
    priority,
    labels,
    nodeId,
  } = body;

  if (user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!id) {
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
  }

  try {
    const existingTask = await prisma.task.findUnique({
      where: { id, userId: user.id },
    });
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const taskData: any = {
      title: title !== undefined ? title.trim() : existingTask.title,
      description:
        description !== undefined ? description : existingTask.description,
      status: status !== undefined ? status : existingTask.status,
      dueDate:
        dueDate !== undefined
          ? dueDate
            ? new Date(dueDate)
            : null
          : existingTask.dueDate,
      priority: priority || existingTask.priority || "medium",
      labels: Array.isArray(labels) ? labels : existingTask.labels || [],
    };

    if (nodeId !== undefined) {
      if (nodeId === null) {
        taskData.node = { disconnect: true };
      } else {
        const nodeExists = await prisma.node.findUnique({
          where: { id: nodeId },
        });
        if (!nodeExists) {
          return NextResponse.json(
            { error: "Invalid nodeId: Node does not exist" },
            { status: 400 }
          );
        }
        taskData.node = { connect: { id: nodeId } };
      }
    }

    const task = await prisma.task.update({
      where: { id, userId: user.id },
      data: taskData,
    });

    const updatedTask = {
      id: task.id,
      title: task.title,
      description: task.description || "",
      status: task.status,
      dueDate: task.dueDate?.toISOString() || null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      assignedTo: user.fullName,
      nodeName: task.nodeId
        ? (await prisma.node.findUnique({ where: { id: task.nodeId } }))?.name
        : null,
      priority: task.priority || "medium",
      labels: task.labels || [],
    };

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error("Error updating task:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      body,
      userId,
      taskId: id,
    });
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    console.error("Error parsing request body:", {
      message: error instanceof Error ? error.message : "Invalid JSON",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { userId } = body;

  if (user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!id) {
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
  }

  try {
    const existingTask = await prisma.task.findUnique({
      where: { id, userId: user.id },
    });
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id, userId: user.id },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting task:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      taskId: id,
    });
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
