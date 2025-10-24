import { prisma } from "@/lib/prisma";

export async function getAllCategories() {
  const categories = await prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      blogs: {
        where: {
          published: true,
        },
        select: {
          id: true,
        },
      },
    },
  });
  return { categories };
}
