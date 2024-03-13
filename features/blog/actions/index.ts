'use server';

import { prisma } from '@/lib/prisma';

import {
  type CreateBlogDTO,
  type UpdateBlogDTO,
  createBlogSchema,
  updateBlogSchema,
} from '../types';

export const isBlogExistByID = async (id: string): Promise<boolean> => {
  const isExist = await prisma.blog.findUnique({ where: { id } });

  return Boolean(isExist);
};

export const getBlogs = async () => {
  const total = await prisma.blog.count();
  const blogs = await prisma.blog.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      tags: true,
    },
  });

  return { blogs, total };
};

export const getPublishedBlogs = async () => {
  const blogs = await prisma.blog.findMany({
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

  const count = await prisma.blog.count({
    where: {
      published: true,
    },
  });

  const total = count ?? 0;

  return { blogs, total };
};

export const getBlogByID = async (id: string) => {
  const blog = await prisma.blog.findUnique({
    where: { id },
    include: {
      tags: true,
    },
  });

  return { blog };
};

export const getPlublishedBlogBySlug = async (slug: string) => {
  const blog = await prisma.blog.findUnique({
    where: { slug, published: true },
    include: {
      tags: true,
    },
  });

  return { blog };
};

export const deleteBlogByID = async (id: string) => {
  const isExist = await isBlogExistByID(id);

  if (!isExist) {
    throw new Error('Blog不存在');
  }

  await prisma.blog.delete({
    where: {
      id,
    },
  });
};

export const createBlog = async (params: CreateBlogDTO) => {
  const result = await createBlogSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors?.join(';');
    // TODO: 记录日志
    throw new Error(error);
  }

  const blogs = await prisma.blog.findMany({
    where: {
      OR: [{ title: result.data.title }, { slug: result.data.slug }],
    },
  });

  if (blogs.length) {
    // TODO: 记录日志
    throw new Error('标题或者slug重复');
  }

  await prisma.blog.create({
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

export const toggleBlogPublished = async (id: string) => {
  const blog = await prisma.blog.findUnique({
    where: {
      id,
    },
  });

  if (!blog) {
    throw new Error('Blog不存在');
  }

  await prisma.blog.update({
    data: {
      published: !blog.published,
    },
    where: {
      id,
    },
  });
};

export const updateBlog = async (params: UpdateBlogDTO) => {
  const result = await updateBlogSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors?.join(';');
    // TODO: 记录日志
    throw new Error(error);
  }

  const blog = await prisma.blog.findUnique({
    where: {
      id: result.data.id,
    },
    include: { tags: true },
  });

  if (!blog) {
    throw new Error('Blog不存在');
  }

  const blogTagIDs = blog?.tags.map((el) => el.id);
  // 新增的 tags
  const needConnect = result.data.tags?.filter(
    (el) => !blogTagIDs?.includes(el),
  );
  // 需要移除的 tags
  const needDisconnect = blog?.tags
    .filter((el) => !result.data.tags?.includes(el.id))
    ?.map((el) => el.id);

  await prisma.blog.update({
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
