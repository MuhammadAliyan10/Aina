import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { validateRequest } from "@/auth";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

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

    const { facebook_id, accessToken, tokenExpiry } = body;
    if (!facebook_id || !accessToken || !tokenExpiry) {
      return NextResponse.json(
        {
          message: "facebook_id, accessToken, and tokenExpiry are required",
        },
        { status: 400 }
      );
    }

    // Fetch the user from the database
    const user = await prisma.user.findUnique({
      where: { id: loggedInUser.id },
    });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const currentTime = new Date();
    const expiryTime = new Date(tokenExpiry);

    if (
      user.providerId !== facebook_id ||
      user.accessToken !== accessToken ||
      (user.tokenExpiry && user.tokenExpiry <= currentTime)
    ) {
      await prisma.user.update({
        where: { id: loggedInUser.id },
        data: {
          providerId: facebook_id,
          accessToken,
          tokenExpiry: expiryTime,
        },
      });
    }

    const token = jwt.sign(
      { userId: loggedInUser.id, facebookId: facebook_id },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return NextResponse.json({ token }, { status: 200 });
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
