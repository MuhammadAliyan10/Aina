import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId, profilePic } = body;

  if (!user || user.id !== userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!profilePic)
    return NextResponse.json(
      { error: "Profile picture is required" },
      { status: 400 }
    );

  try {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { profilePic },
    });
    return NextResponse.json(
      { message: "Profile picture updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating profile picture:", error);
    return NextResponse.json(
      { error: "Failed to update profile picture" },
      { status: 500 }
    );
  }
}
