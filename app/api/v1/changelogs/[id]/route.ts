import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { businessError, success } from "@/lib/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const changelog = await prisma.changelog.findUnique({
      where: { id: BigInt(id) },
    });
    if (!changelog) return businessError("Changelog not found");
    return success(changelog);
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
    const { version, content, date } = body;

    const changelog = await prisma.changelog.update({
      where: { id: BigInt(id) },
      data: { version, content, date },
    });

    return success(changelog);
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
    await prisma.changelog.update({
      where: { id: BigInt(id) },
      data: { deletedAt: new Date() },
    });
    return success(null);
  } catch (e: any) {
    return businessError(e.message);
  }
}
