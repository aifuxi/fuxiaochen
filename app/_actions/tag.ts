'use server';

import { revalidatePath } from 'next/cache';

import { DEFAULT_PAGE_SIZE } from '@/constants';
import { db } from '@/libs/prisma';
import { createTagReqSchema, updateTagReqSchema } from '@/typings/tag';

export async function getTagArticles(params: {
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

export async function getTagByFriendlyURL(friendlyURL: string) {
  const tag = await db.tag.findUnique({
    where: {
      friendlyUrl: friendlyURL,
    },
  });

  return tag;
}

export async function createTag(formData: FormData) {
  const parsed = createTagReqSchema.parse({
    name: formData.get('name'),
    friendlyUrl: formData.get('friendlyUrl'),
  });

  await db.tag.create({
    data: {
      name: parsed.name,
      friendlyUrl: parsed.friendlyUrl,
    },
  });

  revalidatePath('/admin/tag');
}

export async function updateTag(formData: FormData) {
  const parsed = updateTagReqSchema.parse({
    name: formData.get('name'),
    id: formData.get('id'),
    friendlyUrl: formData.get('friendlyUrl'),
  });

  await db.tag.update({
    data: {
      name: parsed.name,
      friendlyUrl: parsed.friendlyUrl,
    },
    where: {
      id: parsed.id,
    },
  });

  revalidatePath('/admin/tag');
}

export async function deleteTag(id: string) {
  await db.tag.delete({
    where: {
      id,
    },
  });

  revalidatePath('/admin/tag');
}

export async function getTags(params: { page: number }) {
  const take = DEFAULT_PAGE_SIZE;
  const skip = (params.page - 1) * DEFAULT_PAGE_SIZE;

  const tags = await db.tag.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      articles: true,
    },
    skip,
    take,
  });

  const count = await db.tag.count({});

  const total = count ?? 0;

  return { tags, total };
}

export async function getAllTags() {
  return await db.tag.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}
