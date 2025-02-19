"use server";
import prisma from "@/lib/prisma";

export const saveFlow = async (flowData: any) => {
  return await prisma.flow.upsert({
    where: { id: flowData.id },
    update: { nodes: flowData.nodes, edges: flowData.edges },
    create: {
      id: flowData.id,
      userId: flowData.userId,
      nodes: flowData.nodes,
      edges: flowData.edges,
    },
  });
};

export const getFlow = async (flowId: string, userId: string) => {
  return await prisma.flow.findFirst({
    where: { id: flowId, userId },
  });
};
