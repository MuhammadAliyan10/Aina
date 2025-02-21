import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

// Define the params type
type RouteParams = {
  id: string;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> } // Wrap params in Promise
) {
  const resolvedParams = await params; // Await the Promise
  const { user } = await validateRequest();
  const body = await request.json();
  const { userId, apiTokenId } = body;

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!resolvedParams.id || !apiTokenId) {
    return NextResponse.json(
      { error: "ID and API token ID are required" },
      { status: 400 }
    );
  }

  try {
    const integration = await prisma.integration.create({
      data: {
        id: resolvedParams.id,
        userId: user.id,
        apiTokenId,
        name: "Integration", // Placeholder; adjust based on actual integration
        status: "CONNECTED",
      },
    });
    return NextResponse.json({ success: true, integration }, { status: 200 });
  } catch (error) {
    console.error("Error connecting integration:", error);
    return NextResponse.json(
      { error: "Failed to connect integration" },
      { status: 500 }
    );
  }
}
