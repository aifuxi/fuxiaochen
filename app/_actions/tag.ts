'use server';

import { DEFAULT_PAGE_SIZE } from '@/constants';
import prisma from '@/libs/prisma';

export async function getTagsWithArticleCountAction() {
  const tags = await prisma.tag.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      articles: {
        where: {
          published: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  return tags;
}

export async function getTagArticlesByFriendlyURLAction(params: {
  friendlyURL: string;
  page: number;
}) {
  const take = DEFAULT_PAGE_SIZE;
  const skip = (params.page - 1) * DEFAULT_PAGE_SIZE;

  const tag = await prisma.tag.findUnique({
    where: {
      friendlyUrl: params.friendlyURL,
    },
    include: {
      articles: {
        where: {
          published: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  const articles = tag?.articles.slice(skip, skip + take);
  const total = tag?.articles.length || 0;

  return { articles, total };
}

export async function getTagByFriendlyURLAction(friendlyURL: string) {
  const tag = await prisma.tag.findUnique({
    where: {
      friendlyUrl: friendlyURL,
    },
  });

  return tag;
}
