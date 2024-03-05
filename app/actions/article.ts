'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {
  type CreateArticleReq,
  type UpdateArticleReq,
} from '@/typings/article';

import { auth } from '@/libs/auth';
import { db } from '@/libs/prisma';

import { DEFAULT_PAGE_SIZE } from '@/constants/unknown';

export async function getArticleBySlug(slug: string) {
  // 未登录，只查出已发布的文章published=true
  let published: boolean | undefined = true;
  const session = await auth();

  if (session?.user?.id) {
    // 登录后，不管文章有没有发布，都查出来
    published = undefined;
  }

  const article = await db.article.findUnique({
    where: {
      slug,
      published,
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

export async function updateArticle(parsed: UpdateArticleReq) {
  const article = await db.article.findFirst({
    where: { id: parsed.id },
    include: { tags: true },
  });

  const articleTagIDs = article?.tags.map((el) => el.id);
  // 新增的 tags
  const needConnect = parsed.tags?.filter((el) => !articleTagIDs?.includes(el));
  // 需要移除的 tags
  const needDisconnect = article?.tags
    .filter((el) => !parsed.tags?.includes(el.id))
    ?.map((el) => el.id);

  await db.article.update({
    data: {
      title: parsed.title,
      description: parsed.description,
      slug: parsed.slug,
      cover: parsed.cover,
      content: parsed.content,
      published: parsed.published,
      tags: {
        connect: needConnect?.length
          ? needConnect.map((tagID) => ({ id: tagID }))
          : undefined,
        disconnect: needDisconnect?.length
          ? needDisconnect.map((tagID) => ({ id: tagID }))
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
export async function getArticle(id: string) {
  const article = await db.article.findFirst({
    where: {
      id,
    },
    include: {
      tags: true,
    },
  });

  return article;
}

export async function createArticle(parsed: CreateArticleReq) {
  await db.article.create({
    data: {
      title: parsed.title,
      slug: parsed.slug,
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

export async function getPublishedArticles() {
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
  });

  const count = await db.article.count({
    where: {
      published: true,
    },
  });

  const total = count ?? 0;

  return { articles, total };
}
