import {
  Category,
  CategoryCreateReq,
  CategoryListReq,
  CategoryListResp,
} from "@/types/category";

import { generateId } from "@/lib/id";
import { prisma } from "@/lib/prisma";

import { ICategoryStore } from "./interface";

export class CategoryStore implements ICategoryStore {
  async create(data: CategoryCreateReq): Promise<Category> {
    const { name, slug, description } = data;
    const category = await prisma.category.create({
      data: {
        id: generateId(),
        name,
        slug,
        description,
      },
    });

    return this.mapToDomain(category);
  }

  async update(
    id: string,
    data: Partial<CategoryCreateReq>,
  ): Promise<Category | null> {
    const category = await prisma.category.update({
      where: { id: BigInt(id) },
      data,
    });

    return this.mapToDomain(category);
  }

  async delete(id: string): Promise<void> {
    await prisma.category.update({
      where: { id: BigInt(id) },
      data: { deletedAt: new Date() },
    });
  }

  async findById(id: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({
      where: { id: BigInt(id) },
    });

    if (!category) return null;
    return this.mapToDomain(category);
  }

  async findAll(params?: CategoryListReq): Promise<CategoryListResp> {
    const { page = 1, pageSize = 10, name } = params || {};
    const skip = (page - 1) * pageSize;
    const where: any = { deletedAt: null };

    if (name) {
      where.name = { contains: name };
    }

    const [total, list] = await Promise.all([
      prisma.category.count({ where }),
      prisma.category.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
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

  private mapToDomain(prismaModel: any): Category {
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
