'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { isArray } from 'lodash-es';

import { DEFAULT_PAGE_SIZE } from '@/constants';
import { db } from '@/libs/prisma';
import {
  createArticleReqSchema,
  updateArticleReqSchema,
} from '@/typings/article';

export async function getArticleByFriendlyURLAction(friendlyURL: string) {
  const article = await db.article.findUnique({
    where: {
      friendlyUrl: friendlyURL,
    },
    include: {
      tags: true,
    },
  });

  return article;
}

export async function getArticles(params: { page: number }) {
  const take = DEFAULT_PAGE_SIZE;
  const skip = (params.page - 1) * DEFAULT_PAGE_SIZE;

  const articles = await db.article.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      tags: true,
    },
    skip,
    take,
  });

  const count = await db.article.count({});

  const total = count ?? 0;

  revalidatePath('/admin/article');
  return { articles, total };
}

export async function deleteArticle(id: string) {
  await db.article.delete({
    where: {
      id,
    },
  });

  revalidatePath('/admin/article');
}

export async function updateArticle(formData: FormData) {
  const parsed = updateArticleReqSchema.parse({
    title: formData.get('title'),
    description: formData.get('description'),
    id: formData.get('id'),
    friendlyUrl: formData.get('friendlyUrl'),
    cover: formData.get('cover'),
    content: formData.get('content'),
    published: formData.get('published'),
    tags: formData.get('tags'),
  });

  await db.article.update({
    data: {
      title: parsed.title,
      description: parsed.description,
      friendlyUrl: parsed.friendlyUrl,
      cover: parsed.cover,
      content: parsed.content,
      published: parsed.published,
      tags: {
        connect: parsed.tags?.length
          ? parsed.tags.map((tagID) => ({ id: tagID }))
          : undefined,
      },
    },
    where: {
      id: parsed.id,
    },
  });

  revalidatePath('/admin/article');
}

export async function toggleArticlePublish(id: string) {
  const article = await db.article.findFirst({
    where: {
      id,
    },
  });

  if (article) {
    await db.article.update({
      data: {
        published: !article.published,
      },
      where: {
        id,
      },
    });
    revalidatePath('/admin/article');
  }
}

export async function createArticle(formData: FormData) {
  const parsed = createArticleReqSchema.parse({
    title: formData.get('title'),
    friendlyUrl: formData.get('friendlyUrl'),
    description: formData.get('description'),
    content: formData.get('content'),
    published: Boolean(formData.get('published')),
    cover: formData.get('cover'),
    tags: isArray(formData.get('tags'))
      ? formData.get('tags')
      : [formData.get('tags')],
  });

  await db.article.create({
    data: {
      title: parsed.title,
      friendlyUrl: parsed.friendlyUrl,
      description: parsed.description,
      content: parsed.content,
      published: parsed.published,
      cover: parsed.cover,
      tags: {
        connect: parsed.tags
          ? parsed.tags.map((tagID) => ({ id: tagID }))
          : undefined,
      },
    },
  });

  redirect('/admin/article');
}

export async function getPublishedArticles(params: { page: number }) {
  const take = DEFAULT_PAGE_SIZE;
  const skip = (params.page - 1) * DEFAULT_PAGE_SIZE;

  const articles = await db.article.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      tags: true,
    },
    where: {
      published: true,
    },
    skip,
    take,
  });

  const count = await db.article.count({
    where: {
      published: true,
    },
  });

  const total = count ?? 0;

  return { articles, total };
}
