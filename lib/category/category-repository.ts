import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

type CategoryRecord = {
  _count: {
    articles: number;
  };
  color: string | null;
  createdAt: Date;
  description: string | null;
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  updatedAt: Date;
};

type CreateCategoryData = {
  color?: string | null;
  description?: string | null;
  name: string;
  slug: string;
  sortOrder: number;
};

type UpdateCategoryData = {
  color?: string | null;
  description?: string | null;
  name?: string;
  slug?: string;
  sortOrder?: number;
};

type FindManyOptions = {
  keyword?: string;
  skip: number;
  take: number;
};

export type CategoryRepository = {
  countByKeyword: (keyword?: string) => Promise<number>;
  create: (data: CreateCategoryData) => Promise<CategoryRecord>;
  delete: (id: string) => Promise<void>;
  findById: (id: string) => Promise<CategoryRecord | null>;
  findByName: (name: string) => Promise<CategoryRecord | null>;
  findBySlug: (slug: string) => Promise<CategoryRecord | null>;
  findManyWithPagination: (options: FindManyOptions) => Promise<CategoryRecord[]>;
  update: (id: string, data: UpdateCategoryData) => Promise<CategoryRecord>;
};

const categorySelect = {
  _count: {
    select: {
      articles: true,
    },
  },
  color: true,
  createdAt: true,
  description: true,
  id: true,
  name: true,
  slug: true,
  sortOrder: true,
  updatedAt: true,
} satisfies Prisma.CategorySelect;

function buildKeywordWhere(keyword?: string): Prisma.CategoryWhereInput {
  if (!keyword) {
    return {};
  }

  return {
    OR: [
      {
        name: {
          contains: keyword,
        },
      },
      {
        slug: {
          contains: keyword,
        },
      },
    ],
  };
}

export function createCategoryRepository(database: PrismaClient = prisma): CategoryRepository {
  return {
    async countByKeyword(keyword) {
      return database.category.count({
        where: buildKeywordWhere(keyword),
      });
    },
    async create(data) {
      return database.category.create({
        data,
        select: categorySelect,
      });
    },
    async delete(id) {
      await database.category.delete({
        where: {
          id,
        },
      });
    },
    async findById(id) {
      return database.category.findUnique({
        select: categorySelect,
        where: {
          id,
        },
      });
    },
    async findByName(name) {
      return database.category.findFirst({
        select: categorySelect,
        where: {
          name,
        },
      });
    },
    async findBySlug(slug) {
      return database.category.findUnique({
        select: categorySelect,
        where: {
          slug,
        },
      });
    },
    async findManyWithPagination({ keyword, skip, take }) {
      return database.category.findMany({
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
        select: categorySelect,
        skip,
        take,
        where: buildKeywordWhere(keyword),
      });
    },
    async update(id, data) {
      return database.category.update({
        data,
        select: categorySelect,
        where: {
          id,
        },
      });
    },
  };
}
