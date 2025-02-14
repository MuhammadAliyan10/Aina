import { NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return NextResponse.json(
        { error: "User not logged in." },
        { status: 401 }
      );
    }

    // Step 2: Fetch user token and expiry details from the database
    const user = await prisma.user.findUnique({
      where: { id: loggedInUser.id },
      select: { accessToken: true, tokenExpiry: true },
    });

    if (!user || !user.accessToken || !user.tokenExpiry) {
      // Token or expiry not found
      return NextResponse.json(
        { message: "Access token or expiry information not found" },
        { status: 404 } // Not Found
      );
    }

    // Step 3: Compare current time with token expiry time
    const { tokenExpiry } = user;
    const currentTime = new Date();

    if (currentTime >= tokenExpiry) {
      // Token has expired
      return NextResponse.json(
        { message: "Token has expired", expired: true },
        { status: 401 } // Unauthorized
      );
    }

    // Step 4: If the token is valid, return success (you can modify this as needed)
    return NextResponse.json({ message: "Token is valid" }, { status: 200 });
  } catch (error) {
    // Step 5: Handle errors
    console.error("Error validating token:", error);
    return NextResponse.json(
      { message: "Error validating token", error: (error as Error).message },
      { status: 500 } // Internal Server Error
    );
  }
}
