'use server';

import { type ErrorResponse } from '@/types';

import { prisma } from '@/lib/prisma';

import { isTagExistByID } from './get-tag';

import { type UpdateTagDTO, updateTagSchema } from '../types';

export const updateTag = async (
  params: UpdateTagDTO,
): Promise<ErrorResponse | undefined> => {
  const result = await updateTagSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors?.join(';');
    // TODO: 记录日志
    return { error };
  }

  const isExist = await isTagExistByID(result.data.id);
  if (!isExist) {
    return { error: '标签不存在' };
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
