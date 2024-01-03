'use server';

import { db } from '@/libs/prisma';

export async function countStatistics() {
  const articleCount = await db.article.count({ where: { published: true } });
  const tagCount = await db.tag.count();

  return { articleCount, tagCount };
}
