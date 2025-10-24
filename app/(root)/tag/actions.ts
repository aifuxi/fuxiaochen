"use server";

import { prisma } from "@/lib/prisma";

export const getTagBySlug = async (slug: string) => {
  const tag = await prisma.tag.findUnique({
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

  return { tag };
};
