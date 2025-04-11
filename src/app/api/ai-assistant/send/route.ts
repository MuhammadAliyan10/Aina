import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId, content, attachment, sender = "user" } = body;

  if (!user || user.id !== userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!content && !attachment)
    return NextResponse.json(
      { error: "Content or attachment required" },
      { status: 400 }
    );

  try {
    const message = await prisma.message.create({
      data: {
        userId: user.id,
        content: content || "Attachment",
        sender,
        attachment,
      },
    });
    return NextResponse.json(
      {
        id: message.id,
        content: message.content,
        sender: message.sender,
        timestamp: message.createdAt.toISOString(),
        attachment: message.attachment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
