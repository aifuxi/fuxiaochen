'use server';

import { DEFAULT_PAGE_SIZE } from '@/constants';
import prisma from '@/libs/prisma';

export async function getArticlesAction(params: { page: number }) {
  const take = DEFAULT_PAGE_SIZE;
  const skip = (params.page - 1) * DEFAULT_PAGE_SIZE;

  const articles = await prisma.article.findMany({
    include: {
      tags: true,
    },
    where: {
      published: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take,
    skip,
  });

  const total =
    (await prisma.article.count({
      where: {
        published: true,
      },
    })) ?? 0;

  return { articles, total };
}

export async function getArticleByFriendlyURLAction(friendlyURL: string) {
  const article = await prisma.article.findUnique({
    where: {
      friendlyUrl: friendlyURL,
    },
    include: {
      tags: true,
    },
  });

  return article;
}
