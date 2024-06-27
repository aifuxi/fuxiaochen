"use server";

import { type Prisma } from "@prisma/client";
import { isUndefined } from "lodash-es";

import { ERROR_NO_PERMISSION, PUBLISHED_MAP } from "@/constants";
import { batchGetSnippetUV } from "@/features/statistics";
import { noPermission } from "@/features/user";
import { prisma } from "@/lib/prisma";
import { getSkip } from "@/utils";

import {
  type CreateSnippetDTO,
  type GetSnippetsDTO,
  type UpdateSnippetDTO,
  createSnippetSchema,
  getSnippetsSchema,
  updateSnippetSchema,
} from "../types";

export const isSnippetExistByID = async (id: string): Promise<boolean> => {
  const isExist = await prisma.snippet.findUnique({ where: { id } });

  return Boolean(isExist);
};

export const getSnippets = async (params: GetSnippetsDTO) => {
  const result = await getSnippetsSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors?.join(";");
    throw new Error(error);
  }

  const cond: Prisma.SnippetWhereInput = {};
  if (result.data.title?.trim()) {
    cond.title = { contains: result.data.title.trim() };
  }
  if (result.data.slug?.trim()) {
    cond.slug = { contains: result.data.slug.trim() };
  }
  if (result.data.tags?.length) {
    cond.tags = { some: { id: { in: result.data.tags } } };
  }
  if ((await noPermission()) || !isUndefined(result.data.published)) {
    const searchPublished = PUBLISHED_MAP[result.data.published!];
    if (!isUndefined(searchPublished)) {
      cond.published = searchPublished;
    }
  }

  const sort: Prisma.SnippetOrderByWithRelationInput = {};
  if (result.data.orderBy && result.data.order) {
    sort[result.data.orderBy] = result.data.order;
  }

  const total = await prisma.snippet.count({ where: cond });
  const snippets = await prisma.snippet.findMany({
    include: { tags: true },
    where: cond,
    orderBy: sort,
    take: result.data.pageSize,
    skip: getSkip(result.data.pageIndex, result.data.pageSize),
  });

  return { snippets, total };
};

export const getPublishedSnippets = async () => {
  const total = await prisma.snippet.count({});
  const snippets = await prisma.snippet.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      tags: true,
    },
    where: {
      published: true,
    },
  });

  const m = await batchGetSnippetUV(snippets?.map((el) => el.id));

  return {
    snippets,
    total,
    uvMap: isUndefined(m) ? undefined : Object.fromEntries(m),
  };
};

export const getSnippetByID = async (id: string) => {
  const snippet = await prisma.snippet.findUnique({
    where: { id },
    include: {
      tags: true,
    },
  });

  return { snippet };
};

export const getSnippetBySlug = async (slug: string) => {
  const snippet = await prisma.snippet.findUnique({
    where: { slug, published: true },
    include: {
      tags: true,
    },
  });

  return { snippet };
};

export const deleteSnippetByID = async (id: string) => {
  if (await noPermission()) {
    throw ERROR_NO_PERMISSION;
  }

  const isExist = await isSnippetExistByID(id);

  if (!isExist) {
    throw new Error("Snippet不存在");
  }

  await prisma.snippet.delete({
    where: {
      id,
    },
  });
};

export const createSnippet = async (params: CreateSnippetDTO) => {
  if (await noPermission()) {
    throw ERROR_NO_PERMISSION;
  }
  const result = await createSnippetSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors?.join(";");
    throw new Error(error);
  }

  const existingSnippets = await prisma.snippet.findMany({
    where: {
      OR: [{ title: result.data.title }, { slug: result.data.slug }],
    },
  });

  if (existingSnippets.length) {
    throw new Error("标题或者slug重复");
  }

  await prisma.snippet.create({
    data: {
      ...result.data,
      tags: {
        connect: result.data.tags?.map((tagID) => ({ id: tagID })) || [],
      },
    },
  });
};

export const toggleSnippetPublished = async (id: string) => {
  if (await noPermission()) {
    throw ERROR_NO_PERMISSION;
  }
  const snippet = await prisma.snippet.findUnique({
    where: {
      id,
    },
  });

  if (!snippet) {
    throw new Error("片段不存在");
  }

  await prisma.snippet.update({
    data: {
      published: !snippet.published,
    },
    where: {
      id,
    },
  });
};

export const updateSnippet = async (params: UpdateSnippetDTO) => {
  if (await noPermission()) {
    throw ERROR_NO_PERMISSION;
  }
  const result = await updateSnippetSchema.safeParseAsync(params);

  if (!result.success) {
    throw new Error(result.error.format()._errors?.join(";"));
  }

  const snippet = await prisma.snippet.update({
    where: { id: result.data.id },
    data: {
      title: result.data.title,
      description: result.data.description,
      slug: result.data.slug,
      body: result.data.body,
      published: result.data.published,
      tags: {
        set: result.data.tags?.map((el) => {
          return { id: el };
        }),
      },
    },
    include: { tags: true },
  });

  if (!snippet) {
    throw new Error("Snippet不存在");
  }
};
