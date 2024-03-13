'use server';

import { prisma } from '@/lib/prisma';

import {
  type CreateTagDTO,
  type UpdateTagDTO,
  createTagSchema,
  updateTagSchema,
} from '../types';

export const isTagExistByID = async (id: string): Promise<boolean> => {
  const isExist = await prisma.tag.findUnique({ where: { id } });

  return Boolean(isExist);
};

export const getTags = async () => {
  const total = await prisma.tag.count();
  const tags = await prisma.tag.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      blogs: true,
      _count: true,
    },
  });

  return { tags, total };
};

export const getTagByID = async (id: string) => {
  const tag = await prisma.tag.findUnique({ where: { id } });

  return { tag };
};

export const createTag = async (params: CreateTagDTO) => {
  const result = await createTagSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors?.join(';');
    // TODO: 记录日志
    throw new Error(error);
  }

  const tags = await prisma.tag.findMany({
    where: {
      OR: [{ name: result.data.name }, { slug: result.data.slug }],
    },
  });

  if (tags.length) {
    // TODO: 记录日志
    throw new Error('标签名称或者slug重复');
  }

  await prisma.tag.create({
    data: {
      name: result.data.name,
      slug: result.data.slug,
    },
  });
};

export const deleteTagByID = async (id: string) => {
  const isExist = await isTagExistByID(id);

  if (!isExist) {
    throw new Error('标签不存在');
  }

  await prisma.tag.delete({
    where: {
      id,
    },
  });
};

export const updateTag = async (params: UpdateTagDTO) => {
  const result = await updateTagSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors?.join(';');
    // TODO: 记录日志
    throw new Error(error);
  }

  const isExist = await isTagExistByID(result.data.id);
  if (!isExist) {
    throw new Error('标签不存在');
  }

  await prisma.tag.update({
    data: {
      name: result.data.name,
      slug: result.data.slug,
    },
    where: {
      id: result.data.id,
    },
  });
};
