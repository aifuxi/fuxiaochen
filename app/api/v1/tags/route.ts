import { NextRequest } from "next/server";

import { generateId } from "@/lib/id";
import { prisma } from "@/lib/prisma";
import { businessError, paramError, success } from "@/lib/response";

export async function GET(request: NextRequest) {
  try {
    const list = await prisma.tag.findMany({
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
    const { name, slug, description } = body;

    if (!name || !slug) return paramError("Name and Slug required");

    const tag = await prisma.tag.create({
      data: {
        id: generateId(),
        name,
        slug,
        description,
      },
    });

    return success(tag);
  } catch (e: any) {
    return businessError(e.message);
  }
}
