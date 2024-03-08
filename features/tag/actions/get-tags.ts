'use server';

import { prisma } from '@/lib/prisma';

export const getTags = async () => {
  const total = await prisma.tag.count();
  const tags = await prisma.tag.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      articles: true,
      _count: true,
    },
  });

  return { tags, total };
};
