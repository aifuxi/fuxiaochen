'use server';

import { type ErrorResponse } from '@/types';

import { prisma } from '@/lib/prisma';

import { type CreateTagDTO, createTagSchema } from '../types';

export const createTag = async (
  params: CreateTagDTO,
): Promise<ErrorResponse | undefined> => {
  const result = await createTagSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors?.join(';');
    // TODO: 记录日志
    return { error };
  }

  const isExist = await prisma.tag.findUnique({
    where: {
      name: result.data.name,
      slug: result.data.slug,
    },
  });

  if (isExist) {
    // TODO: 记录日志
    return { error: '标签名称或者slug重复' };
  }

  await prisma.tag.create({
    data: {
      name: result.data.name,
      slug: result.data.slug,
    },
  });
};
