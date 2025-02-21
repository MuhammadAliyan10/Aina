// src/app/api/team/invite/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId, email, role } = body;

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!email || !role) {
    return NextResponse.json(
      { error: "Email and role are required" },
      { status: 400 }
    );
  }

  try {
    const teamMember = await prisma.teamMember.create({
      data: {
        userId: user.id,
        email,
        role,
        status: "invited",
      },
    });

    const newMember = {
      id: teamMember.id,
      email: teamMember.email,
      fullName: email.split("@")[0], // Placeholder; adjust as needed
      role: teamMember.role,
      status: teamMember.status,
    };

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error("Error inviting team member:", error);
    return NextResponse.json(
      { error: "Failed to invite team member" },
      { status: 500 }
    );
  }
}
