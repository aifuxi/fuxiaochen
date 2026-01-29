import { type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { businessError, success } from "@/lib/response";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get("keyword");
  const categoryId = searchParams.get("categoryId");
  const tagId = searchParams.get("tagId");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");

  const where: any = {
    published: true,
  };

  if (keyword) {
    where.title = { contains: keyword };
  }

  if (categoryId) {
    where.categoryId = BigInt(categoryId);
  }

  if (tagId) {
    where.tags = {
      some: {
        tagId: BigInt(tagId),
      },
    };
  }

  try {
    const [total, list] = await Promise.all([
      prisma.blog.count({ where }),
      prisma.blog.findMany({
        where,
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: {
          publishedAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const formattedList = list.map((blog) => ({
      ...blog,
      tags: blog.tags.map((bt) => bt.tag),
    }));

    return success({
      list: formattedList,
      total,
      page,
      pageSize,
    });
  } catch (e: any) {
    return businessError(e.message);
  }
}
