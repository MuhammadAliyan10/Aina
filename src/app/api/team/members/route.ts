// src/app/api/team/members/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";

export async function GET(request: NextRequest) {
  const { user } = await validateRequest();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mock data (replace with real DB query)
  const data = [
    {
      id: user.id,
      email: user.email,
      fullName: user.fullName || "You",
      role: "admin",
      status: "active",
    },
    {
      id: "2",
      email: "team1@example.com",
      fullName: "Jane Doe",
      role: "member",
      status: "active",
    },
    {
      id: "3",
      email: "team2@example.com",
      fullName: "John Smith",
      role: "viewer",
      status: "invited",
    },
  ];

  return NextResponse.json(data, { status: 200 });
}
