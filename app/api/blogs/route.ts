import { isUndefined } from "es-toolkit";
import { z } from "zod";

import { noAdminPermission } from "@/app/actions";

import { createBlogSchema, getBlogsSchema } from "@/types/blog";

import { ERROR_MESSAGE_MAP, PUBLISHED_MAP } from "@/constants";
import { type Prisma } from "@/generated/prisma";
import { createResponse } from "@/lib/common";
import { prisma } from "@/lib/prisma";
import { getSkip } from "@/utils";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams);
  const result = await getBlogsSchema.safeParseAsync({
    ...query,
    tags: query.tags?.split(",") ?? [],
  });

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
  if (result.data.tags?.filter(Boolean)?.length) {
    cond.tags = { some: { id: { in: result.data.tags } } };
  }
  if (result.data.category) {
    cond.category = { id: result.data.category };
  }
  if ((await noAdminPermission()) || !isUndefined(result.data.published)) {
    const searchPublished = PUBLISHED_MAP[result.data.published!];
    if (!isUndefined(searchPublished)) {
      cond.published = searchPublished;
    }
  }

  const total = await prisma.blog.count({ where: cond });
  const blogs = await prisma.blog.findMany({
    include: { tags: true, category: true },
    where: cond,
    orderBy: {
      createdAt: "desc",
    },
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
    prisma.blog.findUnique({
      where: { title: result.data.title },
    }),
    prisma.blog.findUnique({
      where: { slug: result.data.slug },
    }),
  ]);

  if (existingByTitle) {
    return createResponse({ error: ERROR_MESSAGE_MAP.blogTitleExists });
  }

  if (existingBySlug) {
    return createResponse({ error: ERROR_MESSAGE_MAP.blogSlugExists });
  }

  const tagsParams = result.data.tags?.map((tagID) => ({ id: tagID })) ?? [];
  const categoryParams = result.data.category
    ? { connect: { id: result.data.category } }
    : undefined;

  const data = await prisma.blog.create({
    data: {
      title: result.data.title,
      slug: result.data.slug,
      description: result.data.description,
      published: result.data.published,
      body: result.data.body,
      tags: tagsParams.length
        ? {
            connect: tagsParams,
          }
        : undefined,
      category: categoryParams,
    },
  });

  return createResponse({ data });
}
