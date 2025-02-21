// src/app/api/integrations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";

export async function GET(request: NextRequest) {
  const { user } = await validateRequest();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mock data (replace with real DB query or integration service)
  const data = [
    {
      id: "1",
      name: "Salesforce",
      description: "Sync customer data with your CRM.",
      icon: "https://www.salesforce.com/favicon.ico",
      category: "CRM",
      isConnected: true,
    },
    {
      id: "2",
      name: "Slack",
      description: "Send notifications to your team channels.",
      icon: "https://slack.com/favicon.ico",
      category: "Messaging",
      isConnected: false,
    },
    {
      id: "3",
      name: "Google Drive",
      description: "Store and share files seamlessly.",
      icon: "https://drive.google.com/favicon.ico",
      category: "Storage",
      isConnected: false,
    },
    {
      id: "4",
      name: "Stripe",
      description: "Process payments and invoices.",
      icon: "https://stripe.com/favicon.ico",
      category: "Payment",
      isConnected: true,
    },
    {
      id: "5",
      name: "Whatsapp",
      description: "Send or receive text and data.",
      icon: "https://whatsapp.com/favicon.ico",
      category: "Chat",
      isConnected: true,
    },
  ];

  return NextResponse.json(data, { status: 200 });
}
