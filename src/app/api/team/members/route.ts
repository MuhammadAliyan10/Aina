import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

// Define the params type
type RouteParams = {
  id: string;
};

export async function GET(request: NextRequest) {
  const { user } = await validateRequest();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        fullName: member.email.split("@")[0], // Placeholder
        role: member.role,
        status: member.status,
      })),
    ];

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> } // Wrap params in Promise
) {
  const resolvedParams = await params; // Await the Promise
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId, role } = body;

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!resolvedParams.id || !role) {
    return NextResponse.json(
      { error: "ID and role are required" },
      { status: 400 }
    );
  }

  try {
    await prisma.teamMember.update({
      where: { id: resolvedParams.id, userId: user.id },
      data: { role },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating team member:", error);
    return NextResponse.json(
      { error: "Failed to update team member" },
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
    await prisma.teamMember.delete({
      where: { id: resolvedParams.id, userId: user.id },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting team member:", error);
    return NextResponse.json(
      { error: "Failed to delete team member" },
      { status: 500 }
    );
  }
}
