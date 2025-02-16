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
