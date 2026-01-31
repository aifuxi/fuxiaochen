"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStatsAction() {
  try {
    const [
      blogCount,
      publishedBlogCount,
      categoryCount,
      tagCount,
      userCount,
      recentBlogs,
    ] = await Promise.all([
      prisma.blog.count(),
      prisma.blog.count({ where: { published: true } }),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.user.count(),
      prisma.blog.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        blogCount,
        publishedBlogCount,
        categoryCount,
        tagCount,
        userCount,
        recentBlogs,
      },
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return {
      success: false,
      error: "Failed to fetch dashboard stats",
    };
  }
}
