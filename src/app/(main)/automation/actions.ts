"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function fetchSingleAutomation(id: string) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return { error: "Unauthorized. Please log in." };
    }

    const automation = await prisma.automation.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!automation) {
      return { error: "Automation not found." };
    }

    return automation;
  } catch (error) {
    console.error("Error fetching automation:", error);
    return { error: "Something went wrong. Please try again later." };
  }
}

export const updateUserAutomation = async (
  automationId: string,
  updateData: Partial<{
    title: string;
    description: string;
    automationUrl: string;
    type: string;
    executeAt: Date;
    keywords: string[];
    credentials: Record<string, string>;
    process: string;
    file: string;
  }>
) => {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return { error: "Unauthorized. Please log in." };
    }

    // Remove empty or null fields
    const validUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(
        ([_, value]) => value !== "" && value !== null && value !== undefined
      )
    );

    if (Object.keys(validUpdateData).length === 0) {
      return { error: "No valid fields to update." };
    }

    const automation = await prisma.automation.update({
      where: {
        id: automationId,
        userId: user.id,
      },
      data: validUpdateData,
    });

    return { success: true, automation };
  } catch (error) {
    console.error("Error updating automation:", error);
    return { error: "An error occurred while updating the automation." };
  }
};
