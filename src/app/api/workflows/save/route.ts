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

  const {
    workflowId,
    title,
    description: workflowDescription,
    nodes,
    edges,
  } = body;

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

  console.log(
    "Received nodes:",
    nodes.map((n: any) => ({ id: n.id, type: n.type }))
  );
  console.log("Received edges:", edges);

  const invalidNodes = nodes.filter(
    (node: any) =>
      !node.id ||
      typeof node.id !== "string" ||
      !node.type ||
      typeof node.type !== "string"
  );
  if (invalidNodes.length > 0) {
    console.log("Invalid nodes detected:", invalidNodes);
    return NextResponse.json(
      {
        error:
          "Invalid nodes: Each node must have a valid string 'id' and 'type'",
        details: invalidNodes,
      },
      { status: 400 }
    );
  }

  const nodeIds = new Set(nodes.map((node: any) => node.id));
  const validEdges = edges.filter(
    (edge: any) =>
      edge.id &&
      typeof edge.id === "string" &&
      edge.sourceId &&
      typeof edge.sourceId === "string" &&
      edge.targetId &&
      typeof edge.targetId === "string" &&
      nodeIds.has(edge.sourceId) &&
      nodeIds.has(edge.targetId)
  );
  const invalidEdges = edges.filter((edge: any) => !validEdges.includes(edge));

  if (invalidEdges.length > 0) {
    const detailedInvalidEdges = invalidEdges.map((edge: any) => ({
      id: edge.id,
      sourceId: edge.sourceId,
      targetId: edge.targetId,
      issue:
        !nodeIds.has(edge.sourceId) && !nodeIds.has(edge.targetId)
          ? "Both sourceId and targetId not found in nodes"
          : !nodeIds.has(edge.sourceId)
          ? "sourceId not found in nodes"
          : "targetId not found in nodes",
    }));
    console.warn("Filtered out invalid edges:", detailedInvalidEdges);
  }

  try {
    const workflow = await prisma.workflow.upsert({
      where: { id: workflowId },
      update: {
        title,
        description: workflowDescription || null,
        updatedAt: new Date(),
        nodes: {
          deleteMany: {},
          create: nodes.map((node: any) => ({
            id: node.id,
            name: node.name || "Unnamed Node",
            type: node.type,
            description: node.description || node.data?.description || null,
            positionX: node.position?.x ?? node.positionX ?? 0,
            positionY: node.position?.y ?? node.positionY ?? 0,
            config: node.data?.config || node.config || {},
          })),
        },
        edges: {
          deleteMany: {},
          create: validEdges.map((edge: any) => ({
            id: edge.id,
            sourceId: edge.source || edge.sourceId,
            targetId: edge.target || edge.targetId,
          })),
        },
      },
      create: {
        id: workflowId,
        title,
        description: workflowDescription || null,
        userId: user.id,
        nodes: {
          create: nodes.map((node: any) => ({
            id: node.id,
            name: node.name || "Unnamed Node",
            type: node.type,
            description: node.description || node.data?.description || null,
            positionX: node.position?.x ?? node.positionX ?? 0,
            positionY: node.position?.y ?? node.positionY ?? 0,
            config: node.data?.config || node.config || {},
          })),
        },
        edges: {
          create: validEdges.map((edge: any) => ({
            id: edge.id,
            sourceId: edge.source || edge.sourceId,
            targetId: edge.target || edge.targetId,
          })),
        },
      },
      include: { nodes: true, edges: true },
    });

    console.log(
      `Workflow ${workflowId} saved successfully for user ${user.id}`
    );
    return NextResponse.json({ success: true, workflow }, { status: 200 });
  } catch (error) {
    console.error(
      "Error saving workflow:",
      error instanceof Error ? error.message : String(error),
      {
        workflowId,
        userId: user.id,
        nodesCount: nodes.length,
        edgesCount: edges.length,
      }
    );
    return NextResponse.json(
      {
        error: "Failed to save workflow",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
