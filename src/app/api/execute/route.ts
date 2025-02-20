// src/app/api/execute/route.ts
import { NextRequest, NextResponse } from "next/server";
import AutomationExecutor from "../../(mainPages)/tasks/(automations)/AutomationExecutor"; // Adjust path

export async function POST(request: NextRequest) {
  try {
    const { nodes, edges } = await request.json();

    const executor = new AutomationExecutor(nodes, edges);
    const result = await executor.execute();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Execution failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
