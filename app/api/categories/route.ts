import { z } from "zod";

import { noAdminPermission } from "@/app/actions";

import { createCategorySchema, getCategoriesSchema } from "@/types/category";

import { ERROR_MESSAGE_MAP } from "@/constants";
import { type Prisma } from "@/generated/prisma";
import { createResponse } from "@/lib/common";
import { prisma } from "@/lib/prisma";
import { getSkip } from "@/utils";

export async function GET(request: Request) {
  const url = new URL(request.url);
  let query = Object.fromEntries(url.searchParams);
  const result = await getCategoriesSchema.safeParseAsync(query);

  if (!result.success) {
    const error = z.prettifyError(result.error);
    return createResponse({ error });
  }

  const where: Prisma.CategoryWhereInput = {};

  if (result.data.name) {
    where.OR = [
      {
        name: {
          contains: result.data.name.trim(),
        },
      },
    ];
  }

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where,
      include: {
        blogs: true,
        _count: true,
      },
      take: result.data.pageSize,
      skip: getSkip(result.data.pageIndex, result.data.pageSize),
    }),
    prisma.category.count({ where }),
  ]);

  return createResponse({ data: { categories, total } });
}

export async function POST(request: Request) {
  if (await noAdminPermission()) {
    return createResponse({ error: ERROR_MESSAGE_MAP.noPermission });
  }

  const params = await request.json();
  const result = await createCategorySchema.safeParseAsync(params);

  if (!result.success) {
    const error = z.prettifyError(result.error);
    return createResponse({ error });
  }

  const { name, slug } = result.data;

  const [existingCategoryByName, existingCategoryBySlug] = await Promise.all([
    prisma.category.findUnique({
      where: {
        name,
      },
    }),
    prisma.category.findUnique({
      where: {
        slug,
      },
    }),
  ]);

  if (existingCategoryByName) {
    return createResponse({ error: ERROR_MESSAGE_MAP.categoryNameExists });
  }

  if (existingCategoryBySlug) {
    return createResponse({ error: ERROR_MESSAGE_MAP.categorySlugExists });
  }

  const data = await prisma.category.create({
    data: { name, slug },
  });

  return createResponse({ data });
}
