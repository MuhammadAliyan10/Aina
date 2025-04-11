"use server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export const fetchUserWorkFlow = async () => {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return {
        error: "No user found. Unauthorized",
      };
    }
    const workFlows = await prisma.workflow.findMany({
      where: { userId: user.id },
      include: { nodes: true },
    });
    if (!workFlows) {
      return {
        error: "No workflows found",
      };
    }
    return workFlows;
  } catch (error) {
    console.log(error);
    return {
      error: "Error fetching workflows",
    };
  }
};
