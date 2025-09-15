import { type Prisma } from "@prisma/client";
import { z } from "zod";

import { ERROR_MESSAGE_MAP } from "@/constants";
import { createTagSchema, getTagsSchema } from "@/features/tag";
import { noAdminPermission } from "@/features/user";
import { createResponse } from "@/lib/common";
import { prisma } from "@/lib/prisma";
import { getSkip } from "@/utils";

export async function GET(request: Request) {
  const url = new URL(request.url);
  let query = Object.fromEntries(url.searchParams);
  const result = await getTagsSchema.safeParseAsync(query);

  if (!result.success) {
    const error = z.prettifyError(result.error);
    return createResponse({ error });
  }

  const where: Prisma.TagWhereInput = {};

  if (result.data.type) {
    where.type = result.data.type;
  }

  if (result.data.name) {
    where.OR = [
      {
        name: {
          contains: result.data.name.trim(),
        },
      },
    ];
  }

  const orderBy: Prisma.TagOrderByWithRelationInput = {};
  if (result.data.orderBy && result.data.order) {
    orderBy[result.data.orderBy] = result.data.order;
  }

  const [tags, total] = await Promise.all([
    prisma.tag.findMany({
      orderBy,
      where,
      include: {
        blogs: true,
        notes: true,
        snippets: true,
        _count: true,
      },
      take: result.data.pageSize,
      skip: getSkip(result.data.pageIndex, result.data.pageSize),
    }),
    prisma.tag.count({ where }),
  ]);

  return createResponse({ data: { tags, total } });
}

export async function POST(request: Request) {
  if (await noAdminPermission()) {
    return createResponse({ error: ERROR_MESSAGE_MAP.noPermission });
  }

  const params = await request.json();
  const result = await createTagSchema.safeParseAsync(params);

  if (!result.success) {
    const error = z.prettifyError(result.error);
    return createResponse({ error });
  }

  const { name, slug, type, icon, iconDark } = result.data;

  const [existingTagByName, existingTagBySlug] = await Promise.all([
    prisma.tag.findFirst({
      where: {
        name,
      },
    }),
    prisma.tag.findFirst({
      where: {
        slug,
      },
    }),
  ]);

  if (existingTagByName) {
    return createResponse({ error: ERROR_MESSAGE_MAP.tagNameExists });
  }

  if (existingTagBySlug) {
    return createResponse({ error: ERROR_MESSAGE_MAP.tagSlugExists });
  }

  const data = await prisma.tag.create({
    data: { name, slug, type, icon, iconDark },
  });

  return createResponse({ data });
}
