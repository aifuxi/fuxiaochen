"use server";

import { prisma } from "@/lib/prisma";

export const getPublishedBlogs = async () => {
  const blogs = await prisma.blog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      tags: true,
      category: true,
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
