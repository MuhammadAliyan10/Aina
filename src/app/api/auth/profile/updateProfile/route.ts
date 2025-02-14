import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

export async function POST(request: Request) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { message: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { fullName, bio } = body;

    // Find user from the database
    const user = await prisma.user.findUnique({
      where: { id: loggedInUser.id },
    });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const updateData: { fullName?: string; bio?: string } = {};

    if (fullName && fullName.trim()) {
      updateData.fullName = fullName.trim();
    }
    if (bio && bio.trim()) {
      updateData.bio = bio.trim();
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: loggedInUser.id },
        data: updateData,
      });
      return NextResponse.json(
        { message: "Profile updated successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "No changes made to profile" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);

    return NextResponse.json(
      {
        message: "Failed to process request",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
