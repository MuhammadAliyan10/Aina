// src/app/api/calendar/events/route.ts
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
    const events = await prisma.event.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        description: true,
        start: true,
        end: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const data = events.map((event) => ({
      id: event.id,
      title: event.title,
      start: event.start.toISOString(),
      end: event.end?.toISOString() || null,
      description: event.description || "",
      type: "event",
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    }));

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId, title, description, start, end } = body;

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!title || !start) {
    return NextResponse.json(
      { error: "Title and start are required" },
      { status: 400 }
    );
  }

  try {
    const event = await prisma.event.create({
      data: {
        userId: user.id,
        title,
        description,
        start: new Date(start),
        end: end ? new Date(end) : null,
      },
    });

    const newEvent = {
      id: event.id,
      title: event.title,
      description: event.description || "",
      start: event.start.toISOString(),
      end: event.end?.toISOString() || null,
      type: "event",
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
