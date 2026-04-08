import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

type TagRecord = {
  _count: {
    articleTags: number;
  };
  createdAt: Date;
  description: string | null;
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  updatedAt: Date;
};

type CreateTagData = {
  description?: string | null;
  name: string;
  slug: string;
  sortOrder: number;
};

type UpdateTagData = {
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

export type TagRepository = {
  countByKeyword: (keyword?: string) => Promise<number>;
  create: (data: CreateTagData) => Promise<TagRecord>;
  delete: (id: string) => Promise<void>;
  findById: (id: string) => Promise<TagRecord | null>;
  findByName: (name: string) => Promise<TagRecord | null>;
  findBySlug: (slug: string) => Promise<TagRecord | null>;
  findManyWithPagination: (options: FindManyOptions) => Promise<TagRecord[]>;
  update: (id: string, data: UpdateTagData) => Promise<TagRecord>;
};

const tagSelect = {
  _count: {
    select: {
      articleTags: true,
    },
  },
  createdAt: true,
  description: true,
  id: true,
  name: true,
  slug: true,
  sortOrder: true,
  updatedAt: true,
} satisfies Prisma.TagSelect;

function buildKeywordWhere(keyword?: string): Prisma.TagWhereInput {
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

export function createTagRepository(database: PrismaClient = prisma): TagRepository {
  return {
    async countByKeyword(keyword) {
      return database.tag.count({
        where: buildKeywordWhere(keyword),
      });
    },
    async create(data) {
      return database.tag.create({
        data,
        select: tagSelect,
      });
    },
    async delete(id) {
      await database.tag.delete({
        where: {
          id,
        },
      });
    },
    async findById(id) {
      return database.tag.findUnique({
        select: tagSelect,
        where: {
          id,
        },
      });
    },
    async findByName(name) {
      return database.tag.findFirst({
        select: tagSelect,
        where: {
          name,
        },
      });
    },
    async findBySlug(slug) {
      return database.tag.findUnique({
        select: tagSelect,
        where: {
          slug,
        },
      });
    },
    async findManyWithPagination({ keyword, skip, take }) {
      return database.tag.findMany({
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
        select: tagSelect,
        skip,
        take,
        where: buildKeywordWhere(keyword),
      });
    },
    async update(id, data) {
      return database.tag.update({
        data,
        select: tagSelect,
        where: {
          id,
        },
      });
    },
  };
}
