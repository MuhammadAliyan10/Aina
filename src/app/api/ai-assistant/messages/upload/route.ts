import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  const { user } = await validateRequest();
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const userId = formData.get("userId") as string;

  if (!user || user.id !== userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!file)
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name}`;
    const path = join(process.cwd(), "public", "uploads", filename);
    await writeFile(path, buffer);
    const url = `/uploads/${filename}`;
    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
