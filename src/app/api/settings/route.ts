import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { hash, verify } from "@node-rs/argon2";

export async function POST(request: NextRequest) {
  let user;
  try {
    const authResult = await validateRequest();
    if (!authResult || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    user = authResult.user;
  } catch (error: unknown) {
    console.log("Authentication error:", error || "Unknown error");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const userId = formData.get("userId") as string;
  if (!userId || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data: any = {
    fullName: formData.get("fullName") as string,
    bio: (formData.get("bio") as string) || null,
    socialLinks: {
      instagram: (formData.get("instagram") as string) || null,
      twitter: (formData.get("twitter") as string) || null,
      website: (formData.get("website") as string) || null,
    },
    twoFAEnabled: formData.get("twoFAEnabled") === "true",
    phoneNumber: (formData.get("phoneNumber") as string) || null,
    sessionTimeout:
      parseInt(formData.get("sessionTimeout") as string, 10) || 30,
    theme: (formData.get("theme") as "light" | "dark" | "system") || "dark",
    fontSize: (formData.get("fontSize") as string) || "16",
  };

  const profilePic = formData.get("profilePic");
  const coverPic = formData.get("coverPic");
  if (profilePic instanceof File) {
    const buffer = Buffer.from(await profilePic.arrayBuffer());
    data.profilePic = `data:${profilePic.type};base64,${buffer.toString(
      "base64"
    )}`;
  }
  if (coverPic instanceof File) {
    const buffer = Buffer.from(await coverPic.arrayBuffer());
    data.coverPic = `data:${coverPic.type};base64,${buffer.toString("base64")}`;
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  try {
    if (!data.fullName) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    if (currentPassword && newPassword) {
      const userRecord = await prisma.user.findUnique({
        where: { id: user.id },
      });
      if (!userRecord || !userRecord.passwordHash) {
        return NextResponse.json(
          { error: "User not found or no password set" },
          { status: 404 }
        );
      }
      const isValid = await verify(userRecord.passwordHash, currentPassword);
      if (!isValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }
      data.passwordHash = await hash(newPassword, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      });
    }

    if (data.twoFAEnabled && !data.phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required for 2FA" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data,
    });

    return NextResponse.json(
      { message: "Settings updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error updating settings:", error || "Unknown error");
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
