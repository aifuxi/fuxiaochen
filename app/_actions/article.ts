'use server';

import { revalidatePath } from 'next/cache';

import { DEFAULT_PAGE_SIZE } from '@/constants';
import { db } from '@/libs/prisma';
import { updateArticleReqSchema } from '@/typings/article';

export async function getArticlesAction(params: { page: number }) {
  const take = DEFAULT_PAGE_SIZE;
  const skip = (params.page - 1) * DEFAULT_PAGE_SIZE;

  const articles = await db.article.findMany({
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
    (await db.article.count({
      where: {
        published: true,
      },
    })) ?? 0;

  return { articles, total };
}

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
