import { type Prisma } from "@prisma/client";
import { isUndefined } from "es-toolkit";
import { z } from "zod";

import { ERROR_MESSAGE_MAP, PUBLISHED_MAP } from "@/constants";
import { createBlogSchema, getBlogsSchema } from "@/features/blog";
import { noAdminPermission } from "@/features/user";
import { createResponse } from "@/lib/common";
import { prisma } from "@/lib/prisma";
import { getSkip } from "@/utils";

export async function GET(request: Request) {
  const url = new URL(request.url);
  let query = Object.fromEntries(url.searchParams);
  const result = await getBlogsSchema.safeParseAsync(query);

  if (!result.success) {
    const error = z.prettifyError(result.error);
    return createResponse({ error });
  }

  const cond: Prisma.BlogWhereInput = {};
  if (result.data.title?.trim()) {
    cond.title = { contains: result.data.title.trim() };
  }
  if (result.data.slug?.trim()) {
    cond.slug = { contains: result.data.slug.trim() };
  }
  if (result.data.tags?.length) {
    cond.tags = { some: { id: { in: result.data.tags } } };
  }
  if ((await noAdminPermission()) || !isUndefined(result.data.published)) {
    const searchPublished = PUBLISHED_MAP[result.data.published!];
    if (!isUndefined(searchPublished)) {
      cond.published = searchPublished;
    }
  }

  const sort: Prisma.BlogOrderByWithRelationInput = {};
  if (result.data.orderBy && result.data.order) {
    sort[result.data.orderBy] = result.data.order;
  }

  const total = await prisma.blog.count({ where: cond });
  const blogs = await prisma.blog.findMany({
    include: { tags: true },
    where: cond,
    orderBy: sort,
    take: result.data.pageSize,
    skip: getSkip(result.data.pageIndex, result.data.pageSize),
  });

  return createResponse({ data: { blogs, total } });
}

export async function POST(request: Request) {
  if (await noAdminPermission()) {
    return createResponse({ error: ERROR_MESSAGE_MAP.noPermission });
  }

  const params = await request.json();
  const result = await createBlogSchema.safeParseAsync(params);

  if (!result.success) {
    const error = z.prettifyError(result.error);
    return createResponse({ error });
  }

  const [existingByTitle, existingBySlug] = await Promise.all([
    prisma.blog.findFirst({
      where: { title: result.data.title },
    }),
    prisma.blog.findFirst({
      where: { slug: result.data.slug },
    }),
  ]);

  if (existingByTitle) {
    return createResponse({ error: ERROR_MESSAGE_MAP.blogTitleExists });
  }

  if (existingBySlug) {
    return createResponse({ error: ERROR_MESSAGE_MAP.blogSlugExists });
  }

  const data = await prisma.blog.create({
    data: {
      ...result.data,
      tags: {
        connect: result.data.tags?.map((tagID) => ({ id: tagID })) ?? [],
      },
    },
  });

  return createResponse({ data });
}
