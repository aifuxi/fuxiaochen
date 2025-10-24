import { prisma } from "@/lib/prisma";

export async function getAllTags() {
  const tags = await prisma.tag.findMany({
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
  return { tags };
}
