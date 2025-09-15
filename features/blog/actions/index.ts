"use server";

import { prisma } from "@/lib/prisma";

export const isBlogExistByID = async (id: string): Promise<boolean> => {
  const isExist = await prisma.blog.findUnique({ where: { id } });

  return Boolean(isExist);
};

export const getPublishedBlogs = async () => {
  const blogs = await prisma.blog.findMany({
    orderBy: {
      createdAt: "desc",
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

  return {
    blogs,
    total,
  };
};

export const getPublishedBlogBySlug = async (slug: string) => {
  const blog = await prisma.blog.findUnique({
    where: { slug, published: true },
    include: {
      tags: true,
    },
  });

  return { blog };
};
