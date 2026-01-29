import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { businessError, success } from "@/lib/response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { featured } = body;

    const blog = await prisma.blog.update({
      where: { id: BigInt(id) },
      data: { featured },
    });

    return success(blog);
  } catch (e: any) {
    return businessError(e.message);
  }
}
