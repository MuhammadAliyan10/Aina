"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Add a new automation
export async function addAutomation(automation: {
  title: string;
  description: string;
  type: string;
}) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return { error: "Unauthorized. Please log in." };
    }

    const newAutomation = await prisma.automation.create({
      data: {
        title: automation.title,
        description: automation.description,
        type: automation.type,
        userId: user.id,
        automationUrl: "",
        credentials: {},
        process: "",
        executeAt: new Date(),
      },
    });
    return newAutomation;
  } catch (error) {
    console.error("Error adding automation:", error);
    throw error;
  }
}

export async function deleteAutomation(id: string) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return { error: "Unauthorized. Please log in." };
    }

    // Ensure the user owns the automation
    const automation = await prisma.automation.findUnique({
      where: { id },
    });

    if (!automation || automation.userId !== user.id) {
      return { error: "Not authorized to delete this automation." };
    }

    await prisma.automation.delete({
      where: { id },
    });
    revalidatePath("/automationHub");
    return { success: "Automation deleted successfully." };
  } catch (error) {
    console.error("Error deleting automation:", error);
    throw error;
  }
}

export async function updateAutomation(
  id: string,
  updates: {
    title?: string;
    description?: string;
    credentials?: { email: string; password: string };
    fileUrl?: string;
    executeAt?: Date;
  }
) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return { error: "Unauthorized. Please log in." };
    }

    const automation = await prisma.automation.findUnique({
      where: { id },
    });

    if (!automation || automation.userId !== user.id) {
      return { error: "Not authorized to update this automation." };
    }

    const updatedAutomation = await prisma.automation.update({
      where: { id },
      data: updates,
    });
    revalidatePath("/automationHub");
    return updatedAutomation;
  } catch (error) {
    console.error("Error updating automation:", error);
    throw error;
  }
}

export const fetchUserAutomation = async () => {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return { error: "Unauthorized. Please log in." };
    }

    // Ensure the user owns the automation
    const automation = await prisma.automation.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        status: true,
      },
    });
    if (!automation) {
      return [];
    }
    return automation;
  } catch (error) {
    console.error("Error updating automation:", error);
    throw error;
  }
};
