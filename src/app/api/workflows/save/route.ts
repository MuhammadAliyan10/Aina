// src/app/api/workflows/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { user } = await validateRequest();
  if (!user) {
    console.log("Unauthorized request received");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch (parseError) {
    console.error("Failed to parse request body:", parseError);
    return NextResponse.json(
      { error: "Invalid request body: Expected JSON" },
      { status: 400 }
    );
  }

  const { workflowId, title, description, nodes, edges } = body;

  if (!workflowId || !title || !Array.isArray(nodes) || !Array.isArray(edges)) {
    console.log("Missing or invalid required fields:", {
      workflowId: !!workflowId,
      title: !!title,
      nodes: Array.isArray(nodes),
      edges: Array.isArray(edges),
    });
    return NextResponse.json(
      {
        error:
          "Missing or invalid required fields: workflowId, title, nodes, or edges must be arrays",
      },
      { status: 400 }
    );
  }

  try {
    const workflow = await prisma.workflow.upsert({
      where: { id: workflowId },
      update: {
        title,
        description: description || null,
        updatedAt: new Date(),
        nodes: {
          deleteMany: {},
          create: nodes.map((node: any) => ({
            id: node.id,
            name: node.name || "Unnamed Node",
            type: node.type,
            positionX: node.positionX ?? 0,
            positionY: node.positionY ?? 0,
            config: node.config || {},
          })),
        },
        edges: {
          deleteMany: {},
          create: edges.map((edge: any) => ({
            id: edge.id,
            sourceId: edge.sourceId,
            targetId: edge.targetId,
          })),
        },
      },
      create: {
        id: workflowId,
        title,
        description: description || null,
        userId: user.id,
        nodes: {
          create: nodes.map((node: any) => ({
            id: node.id,
            name: node.name || "Unnamed Node",
            type: node.type,
            positionX: node.positionX ?? 0,
            positionY: node.positionY ?? 0,
            config: node.config || {},
          })),
        },
        edges: {
          create: edges.map((edge: any) => ({
            id: edge.id,
            sourceId: edge.sourceId,
            targetId: edge.targetId,
          })),
        },
      },
      include: { nodes: true, edges: true },
    });

    return NextResponse.json({ success: true, workflow }, { status: 200 });
  } catch (error) {
    console.error("Error saving workflow:", error);
    return NextResponse.json(
      {
        error: "Failed to save workflow",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
