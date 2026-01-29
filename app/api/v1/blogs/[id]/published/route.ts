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
    const { published } = body;

    const data: any = { published };
    if (published) {
      data.publishedAt = new Date();
    }

    const blog = await prisma.blog.update({
      where: { id: BigInt(id) },
      data,
    });

    return success(blog);
  } catch (e: any) {
    return businessError(e.message);
  }
}
