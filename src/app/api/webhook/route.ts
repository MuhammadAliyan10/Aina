import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verification successful.");
      return new Response(challenge, { status: 200 });
    } else {
      console.warn("Webhook verification failed: Invalid token or mode.");
      return new Response("Forbidden", { status: 403 });
    }
  } catch (error) {
    console.error("Error during GET webhook verification:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Webhook event received:", JSON.stringify(body, null, 2));

    return NextResponse.json({ status: "EVENT_RECEIVED" }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook event:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
