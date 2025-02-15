"use server";

import { validateRequest } from "@/auth";

import prisma from "@/lib/prisma";

interface WorkFlow {
  title: string;
  description: string;
}

export const handleAddWorkFlow = async ({ title, description }: WorkFlow) => {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return {
        error: "No user found. Unauthorized",
      };
    }

    // const existingWorkFlow = await prisma.workflow.findFirst({
    //   where: { userId: user.id, title },
    // });

    // if (existingWorkFlow) {
    //   return {
    //     error:
    //       "Workflow with the same name already exists. Please use other name.",
    //   };
    // }

    const newWorkFlow = await prisma.workflow.create({
      data: {
        title,
        description,
        userId: user.id,
      },
    });

    return newWorkFlow;
  } catch (error) {
    console.error("Error creating workflow:", error);
    return {
      error: "Error creating workflow",
    };
  }
};

export const fetchUserWorkFlow = async () => {
  try {
    const { user } = await validateRequest();
    if (!user) return [];

    const workFlows = await prisma.workflow.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
      },
    });

    return workFlows;
  } catch (error) {
    console.error("Error fetching workflows:", error);
    return [];
  }
};
