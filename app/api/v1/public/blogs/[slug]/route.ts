import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { businessError, success } from "@/lib/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const blog = await prisma.blog.findUnique({
      where: {
        slug,
        published: true,
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!blog) {
      return businessError("Blog not found");
    }

    const formattedBlog = {
      ...blog,
      tags: blog.tags.map((bt) => bt.tag),
    };

    // Increment views? (Not in model)

    return success(formattedBlog);
  } catch (e: any) {
    return businessError(e.message);
  }
}
