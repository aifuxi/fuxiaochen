import { NextRequest } from "next/server";

import { generateId } from "@/lib/id";
import { prisma } from "@/lib/prisma";
import { businessError, paramError, success } from "@/lib/response";

export async function GET(request: NextRequest) {
  try {
    const list = await prisma.category.findMany({
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

    const category = await prisma.category.create({
      data: {
        id: generateId(),
        name,
        slug,
        description,
      },
    });

    return success(category);
  } catch (e: any) {
    return businessError(e.message);
  }
}
