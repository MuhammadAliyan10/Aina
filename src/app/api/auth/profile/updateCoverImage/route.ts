import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId, coverPic } = body;

  if (!user || user.id !== userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!coverPic)
    return NextResponse.json(
      { error: "Cover picture is required" },
      { status: 400 }
    );

  try {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { coverPic },
    });
    return NextResponse.json(
      { message: "Cover picture updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating cover picture:", error);
    return NextResponse.json(
      { error: "Failed to update cover picture" },
      { status: 500 }
    );
  }
}
