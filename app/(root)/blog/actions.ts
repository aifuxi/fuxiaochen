"use server";

import { prisma } from "@/lib/prisma";

export const getPublishedBlogBySlug = async (slug: string) => {
  const blog = await prisma.blog.findUnique({
    where: { slug, published: true },
    include: {
      tags: true,
      category: true,
    },
  });

  return { blog };
};
