import { NextRequest } from "next/server";

import { generateId } from "@/lib/id";
import { prisma } from "@/lib/prisma";
import { businessError, paramError, success } from "@/lib/response";

// List (Admin)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get("keyword");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");

  const where: any = {};

  if (keyword) {
    where.title = { contains: keyword };
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
          createdAt: "desc",
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

// Create
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      description,
      content,
      cover,
      categoryId,
      tagIds,
      published,
      featured,
    } = body;

    if (!title || !slug || !content) {
      return paramError("Missing required fields");
    }

    const id = generateId();

    const blog = await prisma.blog.create({
      data: {
        id,
        title,
        slug,
        description,
        content,
        cover,
        published: published || false,
        featured: featured || false,
        publishedAt: published ? new Date() : null,
        category: categoryId
          ? { connect: { id: BigInt(categoryId) } }
          : undefined,
        tags:
          tagIds && tagIds.length > 0
            ? {
                create: tagIds.map((tid: string) => ({
                  tag: { connect: { id: BigInt(tid) } },
                })),
              }
            : undefined,
      },
    });

    return success(blog);
  } catch (e: any) {
    return businessError(e.message);
  }
}
