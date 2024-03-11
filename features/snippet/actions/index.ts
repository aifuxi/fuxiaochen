'use server';

import { prisma } from '@/lib/prisma';

import {
  type CreateSnippetDTO,
  type UpdateSnippetDTO,
  createSnippetSchema,
  updateSnippetSchema,
} from '../types';

export const isSnippetExistByID = async (id: string): Promise<boolean> => {
  const isExist = await prisma.snippet.findUnique({ where: { id } });

  return Boolean(isExist);
};

export const getSnippets = async () => {
  const total = await prisma.snippet.count();
  const snippets = await prisma.snippet.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      tags: true,
    },
  });

  return { snippets, total };
};

export const getPublishedSnippets = async () => {
  const snippets = await prisma.snippet.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      tags: true,
    },
  });

  const count = await prisma.snippet.count({});

  const total = count ?? 0;

  return { snippets, total };
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

export const getPlublishedSnippetBySlug = async (slug: string) => {
  const snippet = await prisma.snippet.findUnique({
    where: { slug },
    include: {
      tags: true,
    },
  });

  return { snippet };
};

export const deleteSnippetByID = async (id: string) => {
  const isExist = await isSnippetExistByID(id);

  if (!isExist) {
    throw new Error('Snippet不存在');
  }

  await prisma.snippet.delete({
    where: {
      id,
    },
  });
};

export const createSnippet = async (params: CreateSnippetDTO) => {
  const result = await createSnippetSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors?.join(';');
    // TODO: 记录日志
    throw new Error(error);
  }

  const snippets = await prisma.snippet.findMany({
    where: {
      OR: [{ title: result.data.title }, { slug: result.data.slug }],
    },
  });

  if (snippets.length) {
    // TODO: 记录日志
    throw new Error('标题或者slug重复');
  }

  await prisma.snippet.create({
    data: {
      title: result.data.title,
      slug: result.data.slug,
      description: result.data.description,
      body: result.data.body,
      tags: {
        connect: result.data.tags
          ? result.data.tags.map((tagID) => ({ id: tagID }))
          : undefined,
      },
    },
  });
};

export const updateSnippet = async (params: UpdateSnippetDTO) => {
  const result = await updateSnippetSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors?.join(';');
    // TODO: 记录日志
    throw new Error(error);
  }

  const snippet = await prisma.snippet.findUnique({
    where: {
      id: result.data.id,
    },
    include: { tags: true },
  });

  if (!snippet) {
    throw new Error('Snippet不存在');
  }

  const SnippetTagIDs = snippet?.tags.map((el) => el.id);
  // 新增的 tags
  const needConnect = result.data.tags?.filter(
    (el) => !SnippetTagIDs?.includes(el),
  );
  // 需要移除的 tags
  const needDisconnect = snippet?.tags
    .filter((el) => !result.data.tags?.includes(el.id))
    ?.map((el) => el.id);

  await prisma.snippet.update({
    data: {
      title: result.data.title,
      description: result.data.description,
      slug: result.data.slug,
      body: result.data.body,
      tags: {
        connect: needConnect?.length
          ? needConnect.map((tagID) => ({ id: tagID }))
          : undefined,
        disconnect: needDisconnect?.length
          ? needDisconnect.map((tagID) => ({ id: tagID }))
          : undefined,
      },
    },
    where: {
      id: result.data.id,
    },
  });
};
