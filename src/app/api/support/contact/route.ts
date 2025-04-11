import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId, email, subject, message } = body;

  if (!user || user.id !== userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!email || !subject || !message)
    return NextResponse.json({ error: "All fields required" }, { status: 400 });

  try {
    // Simulate email sending (replace with real email service like Nodemailer)
    const contact = await prisma.contactSubmission.create({
      data: { userId: user.id, email, subject, message },
    });
    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return NextResponse.json(
      { error: "Failed to submit contact form" },
      { status: 500 }
    );
  }
}
