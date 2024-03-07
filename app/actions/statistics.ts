'use server';

import { prisma } from '@/lib/prisma';

export async function countStatistics() {
  const articleCount = await prisma.article.count({
    where: { published: true },
  });
  const tagCount = await prisma.tag.count();

  return { articleCount, tagCount };
}
