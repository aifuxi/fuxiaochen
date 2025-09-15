"use server";

import { prisma } from "@/lib/prisma";

export const getSnippetBySlug = async (slug: string) => {
  const snippet = await prisma.snippet.findUnique({
    where: { slug, published: true },
    include: {
      tags: true,
    },
  });

  return { snippet };
};

export const getPublishedSnippets = async () => {
  const snippets = await prisma.snippet.findMany({
    where: { published: true },
    include: {
      tags: true,
    },
  });

  return { snippets };
};
