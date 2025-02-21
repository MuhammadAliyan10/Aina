// src/app/api/integrations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { user } = await validateRequest();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const integrations = await prisma.integration.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        description: true,
        connectedAt: true,
        status: true,
      },
    });

    const data = integrations.map((integration) => ({
      id: integration.id,
      name: integration.name,
      description: integration.description || "",
      icon: "", // Placeholder; fetch from external service or static map if needed
      category: "", // Derive category from name or add to schema if needed
      isConnected: integration.status === "CONNECTED",
    }));

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching integrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch integrations" },
      { status: 500 }
    );
  }
}
