import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { businessError, success } from "@/lib/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const category = await prisma.category.findUnique({
      where: {
        slug,
      },
    });

    if (!category) {
      return businessError("Category not found");
    }

    return success(category);
  } catch (e: any) {
    return businessError(e.message);
  }
}
