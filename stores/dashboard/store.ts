import { type Blog } from "@/types/blog";
import { prisma } from "@/lib/prisma";
import { type DashboardStats } from "./interface";
import { type IDashboardStore } from "./interface";

export class DashboardStore implements IDashboardStore {
  async getDashboardStats(): Promise<DashboardStats> {
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
      blogCount,
      publishedBlogCount,
      categoryCount,
      tagCount,
      userCount,
      recentBlogs: recentBlogs.map(this.mapToDomain),
    };
  }

  private mapToDomain(prismaModel: any): Blog {
    return {
      ...prismaModel,
      id: prismaModel.id.toString(),
      categoryId: prismaModel.categoryId?.toString(),
      createdAt: prismaModel.createdAt.toISOString(),
      updatedAt: prismaModel.updatedAt.toISOString(),
      deletedAt: prismaModel.deletedAt?.toISOString(),
      publishedAt: prismaModel.publishedAt?.toISOString(),
      category: prismaModel.category
        ? {
            ...prismaModel.category,
            id: prismaModel.category.id.toString(),
            createdAt: prismaModel.category.createdAt.toISOString(),
            updatedAt: prismaModel.category.updatedAt.toISOString(),
          }
        : undefined,
      tags: prismaModel.tags?.map((t: any) => ({
        ...t.tag,
        id: t.tag.id.toString(),
        createdAt: t.tag.createdAt.toISOString(),
        updatedAt: t.tag.updatedAt.toISOString(),
      })),
    };
  }
}
