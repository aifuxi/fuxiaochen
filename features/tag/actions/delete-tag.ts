'use server';

import { type ErrorResponse } from '@/types';

import { prisma } from '@/lib/prisma';

import { isTagExistByID } from './get-tag';

export const deleteTagByID = async (
  id: string,
): Promise<ErrorResponse | undefined> => {
  const isExist = await isTagExistByID(id);

  if (!isExist) {
    return { error: '标签不存在' };
  }

  await prisma.tag.delete({
    where: {
      id,
    },
  });
};
