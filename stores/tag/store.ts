import { type Tag, type TagCreateReq, type TagListReq, type TagListResp } from "@/types/tag";
import { prisma } from "@/lib/prisma";
import { type ITagStore } from "./interface";

export class TagStore implements ITagStore {
  async create(data: TagCreateReq): Promise<Tag> {
    const { name, slug, description } = data;
    const tag = await prisma.tag.create({
      data: {
        name,
        slug,
        description,
      },
    });

    return this.mapToDomain(tag);
  }

  async update(id: string, data: Partial<TagCreateReq>): Promise<Tag | null> {
    const tag = await prisma.tag.update({
      where: { id: id },
      data,
    });

    return this.mapToDomain(tag);
  }

  async delete(id: string): Promise<void> {
    await prisma.tag.update({
      where: { id: id },
      data: { deletedAt: new Date() },
    });
  }

  async findById(id: string): Promise<Tag | null> {
    const tag = await prisma.tag.findUnique({
      where: { id: id },
    });

    if (!tag) return null;
    return this.mapToDomain(tag);
  }

  async findAll(params?: TagListReq): Promise<TagListResp> {
    const {
      page = 1,
      pageSize = 10,
      name,
      slug,
      sortBy = "createdAt",
      order = "desc",
    } = params || {};
    const skip = (page - 1) * pageSize;
    const where: any = { deletedAt: null };

    if (name) {
      where.name = { contains: name };
    }
    if (slug) {
      where.slug = { contains: slug };
    }

    const [total, list] = await Promise.all([
      prisma.tag.count({ where }),
      prisma.tag.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: order },
        include: {
          _count: {
            select: { blogs: true },
          },
        },
      }),
    ]);

    return {
      total,
      lists: list.map(this.mapToDomain),
    };
  }

  private mapToDomain(prismaModel: any): Tag {
    return {
      ...prismaModel,
      id: prismaModel.id.toString(),
      createdAt: prismaModel.createdAt.toISOString(),
      updatedAt: prismaModel.updatedAt.toISOString(),
      deletedAt: prismaModel.deletedAt?.toISOString(),
      blogCount: prismaModel._count?.blogs || 0,
    };
  }
}
