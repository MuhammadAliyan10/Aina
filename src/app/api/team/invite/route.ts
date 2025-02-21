// src/app/api/team/invite/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";

export async function POST(request: NextRequest) {
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId, email, role } = body;

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mock response (replace with real DB logic or email service)
  const newMember = {
    id: Date.now().toString(), // Simple ID for demo
    email,
    fullName: email.split("@")[0], // Placeholder name
    role,
    status: "invited",
  };

  return NextResponse.json(newMember, { status: 201 });
}
