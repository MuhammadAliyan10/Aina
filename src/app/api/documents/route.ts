import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"; // For file storage

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(request: NextRequest) {
  const { user } = await validateRequest();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!user || user.id !== userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const documents = await prisma.document.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        content: true,
        fileUrl: true,
        fileType: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(
      documents.map((doc) => ({
        ...doc,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      })),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { user } = await validateRequest();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const userId = formData.get("userId") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string | null;
  const file = formData.get("file") as File | null;

  if (user.id !== userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!title)
    return NextResponse.json({ error: "Title is required" }, { status: 400 });

  try {
    let fileUrl: string | undefined;
    let fileType: string | undefined;
    if (file) {
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: fileName,
        Body: fileBuffer,
        ContentType: file.type,
      });
      await s3Client.send(command);
      fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
      fileType = file.type;
    }

    const document = await prisma.document.create({
      data: {
        userId: user.id,
        title,
        content: content || undefined,
        fileUrl,
        fileType,
      },
    });

    return NextResponse.json(
      {
        id: document.id,
        title: document.title,
        content: document.content,
        fileUrl: document.fileUrl,
        fileType: document.fileType,
        createdAt: document.createdAt.toISOString(),
        updatedAt: document.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}

type RouteParams = { id: string };

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { user } = await validateRequest();
  const { id } = await params;
  const body = await request.json();
  const { userId, title, content } = body;

  if (!user || user.id !== userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!id)
    return NextResponse.json({ error: "ID is required" }, { status: 400 });

  try {
    const document = await prisma.document.update({
      where: { id, userId: user.id },
      data: { title, content },
    });
    return NextResponse.json(
      {
        id: document.id,
        title: document.title,
        content: document.content,
        fileUrl: document.fileUrl,
        fileType: document.fileType,
        updatedAt: document.updatedAt.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { user } = await validateRequest();
  const { id } = await params;
  const body = await request.json();
  const { userId } = body;

  if (!user || user.id !== userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!id)
    return NextResponse.json({ error: "ID is required" }, { status: 400 });

  try {
    await prisma.document.delete({ where: { id, userId: user.id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
