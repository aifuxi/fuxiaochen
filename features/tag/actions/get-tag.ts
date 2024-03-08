'use server';

import { prisma } from '@/lib/prisma';

export const isTagExistByID = async (id: string): Promise<boolean> => {
  const isExist = await prisma.tag.findUnique({ where: { id } });

  return Boolean(isExist);
};
