"use server";

import { prisma } from "@/lib/prisma";

export const getCategoryBySlug = async (slug: string) => {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      blogs: {
        where: {
          published: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          tags: true,
          category: true,
        },
      },
    },
  });

  return { category };
};
