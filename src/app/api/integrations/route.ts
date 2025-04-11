import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid"; // For generating auth tokens

// Simulated OAuth client credentials (replace with real ones in production)
const INTEGRATIONS_CONFIG = {
  "Google Drive": {
    clientId: "your-google-client-id",
    scopes: ["https://www.googleapis.com/auth/drive"],
  },
  Slack: {
    clientId: "your-slack-client-id",
    scopes: ["chat:write", "channels:read"],
  },
  Stripe: { clientId: "your-stripe-client-id", scopes: ["read_write"] },
  // Add more integrations as needed
};

export async function GET(request: NextRequest) {
  const { user } = await validateRequest();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!user || user.id !== userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const integrations = await prisma.integration.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        description: true,
        connectedAt: true,
        status: true,
        permissions: true,
      },
    });

    const data = integrations.map((integration) => ({
      id: integration.id,
      name: integration.name,
      description: integration.description || "",
      icon: `/icons/${integration.name.toLowerCase().replace(/\s+/g, "-")}.png`, // Static icon path
      category: categorizeIntegration(integration.name),
      isConnected: integration.status === "CONNECTED",
      permissions: integration.permissions || [],
      connectedAt: integration.connectedAt?.toISOString(),
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user } = await validateRequest();
  const { id } = await params;
  const body = await request.json();
  const { userId, action } = body;

  if (!user || user.id !== userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const integrationConfig = Object.entries(INTEGRATIONS_CONFIG).find(
    ([name]) => name === id
  )?.[1];
  if (!integrationConfig)
    return NextResponse.json(
      { error: "Integration not supported" },
      { status: 400 }
    );

  try {
    if (action === "connect") {
      // Simulate OAuth flow initiation
      const authUrl = generateAuthUrl(id, integrationConfig);
      return NextResponse.json({ authUrl }, { status: 200 });
    } else if (action === "callback") {
      const { code } = body;
      const token = await simulateTokenExchange(id, code); // Replace with real OAuth token exchange
      const existing = await prisma.integration.findUnique({
        where: { name_userId: { name: id, userId: user.id } },
      });
      if (existing) {
        await prisma.integration.update({
          where: { id: existing.id },
          data: {
            status: "CONNECTED",
            connectedAt: new Date(),
            permissions: integrationConfig.scopes,
            authToken: token,
          },
        });
      } else {
        await prisma.integration.create({
          data: {
            userId: user.id,
            name: id,
            description: `Connected ${id} integration`,
            status: "CONNECTED",
            connectedAt: new Date(),
            permissions: integrationConfig.scopes,
            authToken: token,
          },
        });
      }
      return NextResponse.json({ success: true }, { status: 200 });
    } else if (action === "disconnect") {
      await prisma.integration.update({
        where: { name_userId: { name: id, userId: user.id } },
        data: { status: "DISCONNECTED", connectedAt: null, authToken: null },
      });
      return NextResponse.json({ success: true }, { status: 200 });
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error(`Error handling ${id} integration:`, error);
    return NextResponse.json(
      { error: "Failed to process integration" },
      { status: 500 }
    );
  }
}

function categorizeIntegration(name: string): string {
  const categories: Record<string, string> = {
    "Google Drive": "Storage",
    Slack: "Messaging",
    Stripe: "Payment",
  };
  return categories[name] || "Other";
}

function generateAuthUrl(
  name: string,
  config: { clientId: string; scopes: string[] }
): string {
  const baseUrl = `https://example.com/oauth/authorize`; // Replace with real OAuth provider URL
  return `${baseUrl}?client_id=${config.clientId}&scope=${config.scopes.join(
    " "
  )}&redirect_uri=${encodeURIComponent(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/callback`
  )}&state=${name}`;
}

async function simulateTokenExchange(
  name: string,
  code: string
): Promise<string> {
  // Simulate token exchange; replace with real OAuth provider API call
  return uuidv4();
}
