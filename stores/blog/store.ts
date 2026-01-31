import {
  type Blog,
  type BlogCreateReq,
  type BlogListReq,
  type BlogListResp,
} from "@/types/blog";
import { type Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { type IBlogStore } from "./interface";

export class BlogStore implements IBlogStore {
  async create(data: BlogCreateReq): Promise<Blog> {
    const {
      title,
      slug,
      description,
      content,
      cover,
      published,
      featured,
      categoryId,
      tags,
    } = data;

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        description,
        content,
        cover,
        published: published || false,
        featured: featured || false,
        publishedAt: published ? new Date() : null,
        category: {
          connect: { id: categoryId },
        },
        tags: tags
          ? {
              create: tags.map((tagId) => ({
                tag: {
                  connect: { id: tagId },
                },
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return this.mapToDomain(blog);
  }

  async update(id: string, data: Partial<BlogCreateReq>): Promise<Blog | null> {
    const { tags, categoryId, ...rest } = data;

    const updateData: any = { ...rest };

    if (categoryId) {
      updateData.category = {
        connect: { id: categoryId },
      };
    }

    if (tags) {
      // First delete existing tags
      await prisma.blogTag.deleteMany({
        where: { blogId: id },
      });

      // Then create new ones
      updateData.tags = {
        create: tags.map((tagId) => ({
          tag: {
            connect: { id: tagId },
          },
        })),
      };
    }

    const blog = await prisma.blog.update({
      where: { id: id },
      data: updateData,
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return this.mapToDomain(blog);
  }

  async delete(id: string): Promise<void> {
    await prisma.blog.update({
      where: { id: id },
      data: { deletedAt: new Date() },
    });
  }

  async findById(id: string): Promise<Blog | null> {
    const blog = await prisma.blog.findUnique({
      where: { id: id },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!blog) return null;
    return this.mapToDomain(blog);
  }

  async findBySlug(slug: string): Promise<Blog | null> {
    const blog = await prisma.blog.findUnique({
      where: { slug },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!blog) return null;
    return this.mapToDomain(blog);
  }

  async findAll(params?: BlogListReq): Promise<BlogListResp> {
    const {
      page = 1,
      pageSize = 10,
      title,
      categoryId,
      tagId,
      published,
      featured,
      featuredStatus,
    } = params || {};

    const skip = (page - 1) * pageSize;
    const where: Prisma.BlogWhereInput = { deletedAt: null };

    if (title) where.title = { contains: title };
    if (published !== undefined) where.published = published;
    if (featured !== undefined) where.featured = featured;
    if (featuredStatus === "featured") where.featured = true;
    if (featuredStatus === "unfeatured") where.featured = false;
    if (categoryId) where.categoryId = categoryId;

    if (tagId) {
      where.tags = {
        some: {
          tagId: tagId,
        },
      };
    }

    const [total, list] = await Promise.all([
      prisma.blog.count({ where }),
      prisma.blog.findMany({
        where,
        skip,
        take: pageSize,
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
      total,
      lists: list.map(this.mapToDomain),
    };
  }

  async togglePublish(id: string): Promise<Blog | null> {
    const blog = await prisma.blog.findUnique({
      where: { id: id },
    });

    if (!blog) return null;

    const updatedBlog = await prisma.blog.update({
      where: { id: id },
      data: {
        published: !blog.published,
        publishedAt: !blog.published ? new Date() : null,
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return this.mapToDomain(updatedBlog);
  }

  async toggleFeature(id: string): Promise<Blog | null> {
    const blog = await prisma.blog.findUnique({
      where: { id: id },
    });

    if (!blog) return null;

    const updatedBlog = await prisma.blog.update({
      where: { id: id },
      data: {
        featured: !blog.featured,
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return this.mapToDomain(updatedBlog);
  }

  private mapToDomain(prismaModel: any): Blog {
    return {
      ...prismaModel,
      id: prismaModel.id.toString(),
      categoryId: prismaModel.categoryId.toString(),
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
