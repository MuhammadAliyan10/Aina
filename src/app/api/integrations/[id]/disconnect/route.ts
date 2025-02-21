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
  const { userId } = body;

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!resolvedParams.id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    await prisma.integration.update({
      where: { id: resolvedParams.id, userId: user.id },
      data: { status: "DISCONNECTED" },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error disconnecting integration:", error);
    return NextResponse.json(
      { error: "Failed to disconnect integration" },
      { status: 500 }
    );
  }
}
