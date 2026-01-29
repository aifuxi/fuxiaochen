import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { businessError, success } from "@/lib/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const tag = await prisma.tag.findUnique({
      where: { id: BigInt(id) },
    });
    if (!tag) return businessError("Tag not found");
    return success(tag);
  } catch (e: any) {
    return businessError(e.message);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { name, slug, description } = body;

    const tag = await prisma.tag.update({
      where: { id: BigInt(id) },
      data: { name, slug, description },
    });

    return success(tag);
  } catch (e: any) {
    return businessError(e.message);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await prisma.tag.update({
      where: { id: BigInt(id) },
      data: { deletedAt: new Date() },
    });
    return success(null);
  } catch (e: any) {
    return businessError(e.message);
  }
}
