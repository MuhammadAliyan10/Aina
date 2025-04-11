import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { sendMail } from "@/lib/mail"; // Assuming you have a mail utility

type RouteParams = { slug: string[] };

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { slug } = await params;
  const { user } = await validateRequest();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (slug[0] !== "members") {
    return NextResponse.json({ error: "Invalid endpoint" }, { status: 404 });
  }

  try {
    const teamMembers = await prisma.teamMember.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        invitedAt: true,
      },
    });

    const data = [
      {
        id: user.id,
        email: user.email,
        fullName: user.fullName || "You",
        role: "admin",
        status: "active",
      },
      ...teamMembers.map((member) => ({
        id: member.id,
        email: member.email,
        fullName: member.email.split("@")[0], // Placeholder; enhance later
        role: member.role,
        status: member.status,
      })),
    ];

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching team members:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      userId,
    });
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { slug } = await params;
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId, email, role } = body;

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (slug[0] === "invite") {
    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    try {
      const existingMember = await prisma.teamMember.findFirst({
        where: { userId: user.id, email },
      });
      if (existingMember) {
        return NextResponse.json(
          { error: "Email already invited" },
          { status: 409 }
        );
      }

      const teamMember = await prisma.teamMember.create({
        data: {
          userId: user.id,
          email,
          role,
          status: "invited",
        },
      });

      // Send email invitation (mock implementation; replace with real mail service)
      await sendMail({
        to: email,
        subject: `Team Invitation from ${user.fullName || "QuantumTask"}`,
        html: `<p>You've been invited to join a team as a ${role}. <a href="${process.env.NEXT_PUBLIC_APP_URL}/accept-invite/${teamMember.id}">Accept Invite</a></p>`,
      });

      const newMember = {
        id: teamMember.id,
        email: teamMember.email,
        fullName: teamMember.email.split("@")[0],
        role: teamMember.role,
        status: teamMember.status,
      };

      return NextResponse.json(newMember, { status: 201 });
    } catch (error) {
      console.error("Error inviting team member:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        body,
        userId,
      });
      return NextResponse.json(
        { error: "Failed to invite team member" },
        { status: 500 }
      );
    }
  } else if (slug[0] === "invite" && slug[1] === "resend" && slug[2]) {
    const memberId = slug[2];
    try {
      const member = await prisma.teamMember.findUnique({
        where: { id: memberId, userId: user.id },
      });
      if (!member || member.status === "active") {
        return NextResponse.json(
          { error: "Member not found or already active" },
          { status: 404 }
        );
      }

      // Resend email invitation
      await sendMail({
        to: member.email,
        subject: `Reminder: Team Invitation from ${
          user.fullName || "QuantumTask"
        }`,
        html: `<p>Please accept your invitation to join as a ${member.role}. <a href="${process.env.NEXT_PUBLIC_APP_URL}/accept-invite/${member.id}">Accept Invite</a></p>`,
      });

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.error("Error resending invite:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        memberId,
        userId,
      });
      return NextResponse.json(
        { error: "Failed to resend invite" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "Invalid endpoint" }, { status: 404 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { slug } = await params;
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId, role } = body;

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (slug[0] !== "members" || !slug[1]) {
    return NextResponse.json(
      { error: "Invalid endpoint or missing ID" },
      { status: 400 }
    );
  }

  const memberId = slug[1];

  try {
    const member = await prisma.teamMember.findUnique({
      where: { id: memberId, userId: user.id },
    });
    if (!member) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    await prisma.teamMember.update({
      where: { id: memberId, userId: user.id },
      data: { role },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating team member:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      body,
      userId,
      memberId,
    });
    return NextResponse.json(
      { error: "Failed to update team member" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { slug } = await params;
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId } = body;

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (slug[0] !== "members" || !slug[1]) {
    return NextResponse.json(
      { error: "Invalid endpoint or missing ID" },
      { status: 400 }
    );
  }

  const memberId = slug[1];

  try {
    const member = await prisma.teamMember.findUnique({
      where: { id: memberId, userId: user.id },
    });
    if (!member) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    await prisma.teamMember.delete({
      where: { id: memberId, userId: user.id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting team member:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      memberId,
    });
    return NextResponse.json(
      { error: "Failed to delete team member" },
      { status: 500 }
    );
  }
}
