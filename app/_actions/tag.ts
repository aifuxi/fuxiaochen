'use server';

import { revalidatePath } from 'next/cache';

import { DEFAULT_PAGE_SIZE } from '@/constants';
import { db } from '@/libs/prisma';
import { type CreateTagRequest, type UpdateTagRequest } from '@/types';

export async function getTagsWithArticleCountAction() {
  const tags = await db.tag.findMany({
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

  const tag = await db.tag.findUnique({
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
  const total = tag?.articles.length ?? 0;

  return { articles, total };
}

export async function getTagByFriendlyURLAction(friendlyURL: string) {
  const tag = await db.tag.findUnique({
    where: {
      friendlyUrl: friendlyURL,
    },
  });

  return tag;
}

export async function adminGetTagsAction(params: { page: number }) {
  const take = DEFAULT_PAGE_SIZE;
  const skip = (params.page - 1) * DEFAULT_PAGE_SIZE;

  let tags = await db.tag.findMany({
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

  const count = await db.tag.count({});

  tags = tags?.slice(skip, skip + take);
  const total = count ?? 0;

  revalidatePath('/admin/tag');
  return { tags, total };
}

export async function adminGetAllTagsAction() {
  const tags = await db.tag.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return { tags };
}

export async function adminCreateTagAction(params: CreateTagRequest) {
  const tag = await db.tag.create({
    data: { ...params },
    include: { articles: true },
  });

  revalidatePath('/admin/tag');

  return tag;
}

export async function adminEditTagAction(
  tagID: string,
  params: UpdateTagRequest,
) {
  const tag = await db.tag.update({
    where: {
      id: tagID,
    },
    data: { ...params },
  });

  revalidatePath('/admin/tag');

  return tag;
}

export async function adminDeleteTagAction(tagID: string) {
  const tag = await db.tag.delete({
    where: {
      id: tagID,
    },
  });

  revalidatePath('/admin/tag');

  return tag;
}
