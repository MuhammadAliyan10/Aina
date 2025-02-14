import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

export async function PUT(request: Request) {
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

    const { profilePic } = body;
    console.log(profilePic);

    if (!profilePic || !profilePic.trim()) {
      return NextResponse.json(
        { message: "No profile picture provided." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: loggedInUser.id },
    });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: loggedInUser.id },
      data: { profilePic: profilePic.trim() },
    });

    return NextResponse.json(
      { message: "Profile picture updated successfully" },
      { status: 200 }
    );
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
