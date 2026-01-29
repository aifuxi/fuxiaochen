import { NextRequest } from "next/server";

import { generateId } from "@/lib/id";
import { prisma } from "@/lib/prisma";
import { businessError, paramError, success } from "@/lib/response";

export async function GET(request: NextRequest) {
  try {
    const list = await prisma.changelog.findMany({
      orderBy: { createdAt: "desc" },
    });
    return success(list);
  } catch (e: any) {
    return businessError(e.message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { version, content, date } = body;

    if (!version || !content) return paramError("Version and Content required");

    const changelog = await prisma.changelog.create({
      data: {
        id: generateId(),
        version,
        content,
        date: date || 0,
      },
    });

    return success(changelog);
  } catch (e: any) {
    return businessError(e.message);
  }
}
