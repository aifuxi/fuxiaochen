'use server';

import { type Prisma } from '@prisma/client';

import { ERROR_NO_PERMISSION } from '@/constants';
import { noPermission } from '@/features/user';
import { prisma } from '@/lib/prisma';
import { getSkip } from '@/utils';

import {
  type CreateSnippetDTO,
  type GetSnippetsDTO,
  type UpdateSnippetDTO,
  createSnippetSchema,
  getSnippetsSchema,
  updateSnippetSchema,
} from '../types';

export const isSnippetExistByID = async (id: string): Promise<boolean> => {
  const isExist = await prisma.snippet.findUnique({ where: { id } });

  return Boolean(isExist);
};

export const getSnippets = async (params: GetSnippetsDTO) => {
  const result = await getSnippetsSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors?.join(';');
    // TODO: 记录日志
    throw new Error(error);
  }

  // 无权限，只能查看已发布的
  const published = await noPermission();
  const cond: Prisma.SnippetWhereInput = {};
  // TODO: 想个办法优化一下，这个写法太啰嗦了，好多 if
  if (published) {
    cond.published = published;
  }
  if (result.data.title?.trim()) {
    cond.OR = [
      ...(cond.OR ?? []),
      ...[
        {
          title: {
            contains: result.data.title?.trim(),
          },
        },
      ],
    ];
  }
  if (result.data.slug?.trim()) {
    cond.OR = [
      ...(cond.OR ?? []),
      ...[
        {
          slug: {
            contains: result.data.slug?.trim(),
          },
        },
      ],
    ];
  }
  if (result.data.tags?.length) {
    cond.OR = [
      ...(cond.OR ?? []),
      ...[
        {
          tags: {
            some: {
              id: {
                in: result.data.tags,
              },
            },
          },
        },
      ],
    ];
  }

  const sort: Prisma.SnippetOrderByWithRelationInput = {};
  if (result.data.orderBy && result.data.order) {
    sort[result.data.orderBy] = result.data.order;
  }

  const total = await prisma.snippet.count({ where: cond });
  const snippets = await prisma.snippet.findMany({
    include: {
      tags: true,
    },
    orderBy: sort,
    where: cond,
    take: result.data.pageSize,
    skip: getSkip(result.data.pageIndex, result.data.pageSize),
  });

  return { snippets, total };
};

export const getAllSnippets = async () => {
  const total = await prisma.snippet.count({});
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
    where: { slug },
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
    throw new Error('Snippet不存在');
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
    throw new Error('片段不存在');
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

  const snippetTagIDs = snippet?.tags.map((el) => el.id);
  // 新增的 tags
  const needConnect = result.data.tags?.filter(
    (el) => !snippetTagIDs?.includes(el),
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
