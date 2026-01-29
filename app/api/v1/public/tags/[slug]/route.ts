import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { businessError, success } from "@/lib/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const tag = await prisma.tag.findUnique({
      where: {
        slug,
      },
    });

    if (!tag) {
      return businessError("Tag not found");
    }

    return success(tag);
  } catch (e: any) {
    return businessError(e.message);
  }
}
