'use server';

import { prisma } from '@/lib/prisma';

export const getStatistics = async () => {
  const blogCount = await prisma.blog.count({
    where: { published: true },
  });
  const tagCount = await prisma.tag.count();

  return { blogCount, tagCount };
};
