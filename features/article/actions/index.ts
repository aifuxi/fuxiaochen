'use server';

import { prisma } from '@/lib/prisma';

import {
  type CreateArticleDTO,
  type UpdateArticleDTO,
  createArticleSchema,
  updateArticleSchema,
} from '../types';

export const isArticleExistByID = async (id: string): Promise<boolean> => {
  const isExist = await prisma.article.findUnique({ where: { id } });

  return Boolean(isExist);
};

export const getArticles = async () => {
  const total = await prisma.article.count();
  const articles = await prisma.article.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      tags: true,
    },
  });

  return { articles, total };
};

export const getPublishedArticles = async () => {
  const articles = await prisma.article.findMany({
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

  const count = await prisma.article.count({
    where: {
      published: true,
    },
  });

  const total = count ?? 0;

  return { articles, total };
};

export const getArticleByID = async (id: string) => {
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      tags: true,
    },
  });

  return { article };
};

export const getPlublishedArticleBySlug = async (slug: string) => {
  const article = await prisma.article.findUnique({
    where: { slug, published: true },
    include: {
      tags: true,
    },
  });

  return { article };
};

export const deleteArticleByID = async (id: string) => {
  const isExist = await isArticleExistByID(id);

  if (!isExist) {
    throw new Error('文章不存在');
  }

  await prisma.article.delete({
    where: {
      id,
    },
  });
};

export const createArticle = async (params: CreateArticleDTO) => {
  const result = await createArticleSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors?.join(';');
    // TODO: 记录日志
    throw new Error(error);
  }

  const articles = await prisma.article.findMany({
    where: {
      OR: [{ title: result.data.title }, { slug: result.data.slug }],
    },
  });

  if (articles.length) {
    // TODO: 记录日志
    throw new Error('标题或者slug重复');
  }

  await prisma.article.create({
    data: {
      title: result.data.title,
      slug: result.data.slug,
      description: result.data.description,
      body: result.data.body,
      published: result.data.published,
      cover: result.data.cover,
      tags: {
        connect: result.data.tags
          ? result.data.tags.map((tagID) => ({ id: tagID }))
          : undefined,
      },
    },
  });
};

export const toggleArticlePublished = async (id: string) => {
  const article = await prisma.article.findUnique({
    where: {
      id,
    },
  });

  if (!article) {
    throw new Error('文章不存在');
  }

  await prisma.article.update({
    data: {
      published: !article.published,
    },
    where: {
      id,
    },
  });
};

export const updateArticle = async (params: UpdateArticleDTO) => {
  const result = await updateArticleSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors?.join(';');
    // TODO: 记录日志
    throw new Error(error);
  }

  const article = await prisma.article.findUnique({
    where: {
      id: result.data.id,
    },
    include: { tags: true },
  });

  if (!article) {
    throw new Error('文章不存在');
  }

  const articleTagIDs = article?.tags.map((el) => el.id);
  // 新增的 tags
  const needConnect = result.data.tags?.filter(
    (el) => !articleTagIDs?.includes(el),
  );
  // 需要移除的 tags
  const needDisconnect = article?.tags
    .filter((el) => !result.data.tags?.includes(el.id))
    ?.map((el) => el.id);

  await prisma.article.update({
    data: {
      title: result.data.title,
      description: result.data.description,
      slug: result.data.slug,
      cover: result.data.cover,
      body: result.data.body,
      published: result.data.published,
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
      id: result.data.id,
    },
  });
};
