'use server';

import { prisma } from '@/lib/prisma';

export const getStatistics = async () => {
  const articleCount = await prisma.article.count({
    where: { published: true },
  });
  const tagCount = await prisma.tag.count();

  return { articleCount, tagCount };
};
