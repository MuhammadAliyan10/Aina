import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

export async function POST(request: NextRequest) {
  console.log("Received POST request to /api/workflows/save", {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers),
  });

  try {
    // Validate authentication
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      console.log("Unauthorized request received");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
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

    console.log("Received payload:", JSON.stringify(body, null, 2));

    if (!body) {
      console.log("No payload received in request");
      return NextResponse.json(
        { error: "No payload provided" },
        { status: 400 }
      );
    }

    const { workflowId, title, description, nodes, edges } = body;

    // Validate required fields
    if (
      !workflowId ||
      !title ||
      !Array.isArray(nodes) ||
      !Array.isArray(edges)
    ) {
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

    // Perform upsert
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
            config: node.config || {}, // Now valid with schema update
          })),
        },
        Edge: {
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
        userId: loggedInUser.id,
        nodes: {
          create: nodes.map((node: any) => ({
            id: node.id,
            name: node.name || "Unnamed Node",
            type: node.type,
            positionX: node.positionX ?? 0,
            positionY: node.positionY ?? 0,
            config: node.config || {}, // Now valid with schema update
          })),
        },
        Edge: {
          create: edges.map((edge: any) => ({
            id: edge.id,
            sourceId: edge.sourceId,
            targetId: edge.targetId,
          })),
        },
      },
    });

    console.log("Workflow upsert completed successfully:", workflow.id);
    return NextResponse.json({ success: true, workflow }, { status: 200 });
  } catch (error) {
    console.error(
      "Error saving workflow:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      {
        error: "Failed to save workflow",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
