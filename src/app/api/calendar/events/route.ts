import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { user } = await validateRequest();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!user || user.id !== userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [events, tasks] = await Promise.all([
      prisma.event.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          title: true,
          description: true,
          start: true,
          end: true,
        },
      }),
      prisma.task.findMany({
        where: { userId: user.id },
        select: { id: true, title: true, description: true, dueDate: true },
      }),
    ]);

    const data = [
      ...events.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.start.toISOString(),
        end: event.end?.toISOString(),
        description: event.description || "",
        type: "event" as const,
      })),
      ...tasks.map((task) => ({
        id: task.id,
        title: task.title,
        start: task.dueDate?.toISOString() || new Date().toISOString(),
        description: task.description || "",
        type: "task" as const,
      })),
    ];

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId, title, description, start, end, type } = body;

  if (!user || user.id !== userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!title || !start)
    return NextResponse.json(
      { error: "Title and start are required" },
      { status: 400 }
    );

  try {
    const data = {
      userId: user.id,
      title,
      description,
      start: new Date(start),
      ...(end && { end: new Date(end) }),
    };
    const result =
      type === "event"
        ? await prisma.event.create({ data })
        : await prisma.task.create({
            data: { ...data, dueDate: new Date(start) },
          });

    return NextResponse.json(
      {
        id: result.id,
        title: result.title,
        start:
          type === "event"
            ? "start" in result
              ? "start" in result && result.start
                ? result.start.toISOString()
                : result.dueDate!.toISOString()
              : result.dueDate!.toISOString()
            : "dueDate" in result && result.dueDate
            ? result.dueDate.toISOString()
            : new Date().toISOString(),
        end:
          type === "event" && "end" in result
            ? result.end?.toISOString()
            : undefined,
        description: result.description || "",
        type,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user } = await validateRequest();
  const { id } = await params;
  const body = await request.json();
  const { userId, title, description, start, end, type } = body;

  if (!user || user.id !== userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = {
      title,
      description,
      start: new Date(start),
      ...(end && { end: new Date(end) }),
    };
    const result =
      type === "event"
        ? await prisma.event.update({ where: { id, userId: user.id }, data })
        : await prisma.task.update({
            where: { id, userId: user.id },
            data: { ...data, dueDate: new Date(start) },
          });

    return NextResponse.json(
      {
        id: result.id,
        title: result.title,
        start:
          type === "event"
            ? result.start.toISOString()
            : result.dueDate!.toISOString(),
        end: type === "event" ? result.end?.toISOString() : undefined,
        description: result.description || "",
        type,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user } = await validateRequest();
  const { id } = await params;
  const body = await request.json();
  const { userId } = body;

  if (!user || user.id !== userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const event = await prisma.event.findUnique({
      where: { id, userId: user.id },
    });
    if (event) {
      await prisma.event.delete({ where: { id, userId: user.id } });
    } else {
      await prisma.task.delete({ where: { id, userId: user.id } });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
