import { type Prisma, type PrismaClient } from "@/generated/prisma/client";
import type { ArticleStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import type { ListArticlesQuery } from "@/lib/article/article-dto";

type ArticleCategoryRecord = {
  color: string | null;
  id: string;
  name: string;
  slug: string;
};

type ArticleTagRecord = {
  tag: {
    id: string;
    name: string;
    slug: string;
  };
};

type ArticleListRecord = {
  archivedAt: Date | null;
  articleTags: ArticleTagRecord[];
  category: ArticleCategoryRecord | null;
  commentCount: number;
  createdAt: Date;
  excerpt: string | null;
  id: string;
  isFeatured: boolean;
  likeCount: number;
  publishedAt: Date | null;
  readingTimeMinutes: number | null;
  slug: string;
  status: ArticleStatus;
  title: string;
  updatedAt: Date;
  viewCount: number;
};

type ArticleDetailRecord = ArticleListRecord & {
  categoryId: string | null;
  contentHtml: string | null;
  contentMarkdown: string | null;
  coverAssetId: string | null;
  seoDescription: string | null;
  seoTitle: string | null;
};

type ArticleCreateData = {
  archivedAt?: Date | null;
  categoryId?: string | null;
  contentHtml?: string | null;
  contentMarkdown?: string | null;
  coverAssetId?: string | null;
  excerpt?: string | null;
  isFeatured: boolean;
  publishedAt?: Date | null;
  readingTimeMinutes?: number | null;
  seoDescription?: string | null;
  seoTitle?: string | null;
  slug: string;
  status: ArticleStatus;
  tagIds?: string[];
  title: string;
};

type ArticleUpdateData = {
  archivedAt?: Date | null;
  categoryId?: string | null;
  contentHtml?: string | null;
  contentMarkdown?: string | null;
  coverAssetId?: string | null;
  excerpt?: string | null;
  isFeatured?: boolean;
  publishedAt?: Date | null;
  readingTimeMinutes?: number | null;
  seoDescription?: string | null;
  seoTitle?: string | null;
  slug?: string;
  status?: ArticleStatus;
  tagIds?: string[];
  title?: string;
};

type FindManyOptions = ListArticlesQuery & {
  skip: number;
  take: number;
};

export type ArticleRepository = {
  countByFilters: (filters: ListArticlesQuery) => Promise<number>;
  create: (data: ArticleCreateData) => Promise<ArticleDetailRecord>;
  delete: (id: string) => Promise<void>;
  findById: (id: string) => Promise<ArticleDetailRecord | null>;
  findBySlug: (slug: string) => Promise<ArticleDetailRecord | null>;
  findCategoryById: (id: string) => Promise<{ id: string } | null>;
  findManyWithPagination: (options: FindManyOptions) => Promise<ArticleListRecord[]>;
  findTagsByIds: (ids: string[]) => Promise<Array<{ id: string }>>;
  update: (id: string, data: ArticleUpdateData) => Promise<ArticleDetailRecord>;
};

const articleCategorySelect = {
  color: true,
  id: true,
  name: true,
  slug: true,
} satisfies Prisma.CategorySelect;

const articleTagSelect = {
  tag: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.ArticleTagSelect;

const articleListSelect = {
  archivedAt: true,
  articleTags: {
    orderBy: {
      tag: {
        sortOrder: "asc",
      },
    },
    select: articleTagSelect,
  },
  category: {
    select: articleCategorySelect,
  },
  commentCount: true,
  createdAt: true,
  excerpt: true,
  id: true,
  isFeatured: true,
  likeCount: true,
  publishedAt: true,
  readingTimeMinutes: true,
  slug: true,
  status: true,
  title: true,
  updatedAt: true,
  viewCount: true,
} satisfies Prisma.ArticleSelect;

const articleDetailSelect = {
  ...articleListSelect,
  categoryId: true,
  contentHtml: true,
  contentMarkdown: true,
  coverAssetId: true,
  seoDescription: true,
  seoTitle: true,
} satisfies Prisma.ArticleSelect;

function buildArticleWhere(filters: Pick<ListArticlesQuery, "categoryId" | "keyword" | "status">): Prisma.ArticleWhereInput {
  return {
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.keyword
      ? {
          OR: [
            {
              title: {
                contains: filters.keyword,
              },
            },
            {
              slug: {
                contains: filters.keyword,
              },
            },
            {
              excerpt: {
                contains: filters.keyword,
              },
            },
          ],
        }
      : {}),
  };
}

export function createArticleRepository(database: PrismaClient = prisma): ArticleRepository {
  return {
    async countByFilters(filters) {
      return database.article.count({
        where: buildArticleWhere(filters),
      });
    },
    async create(data) {
      const { tagIds, ...articleData } = data;

      return database.article.create({
        data: {
          ...articleData,
          ...(tagIds && tagIds.length > 0
            ? {
                articleTags: {
                  create: tagIds.map((tagId) => ({
                    tagId,
                  })),
                },
              }
            : {}),
        },
        select: articleDetailSelect,
      });
    },
    async delete(id) {
      await database.article.delete({
        where: {
          id,
        },
      });
    },
    async findById(id) {
      return database.article.findUnique({
        select: articleDetailSelect,
        where: {
          id,
        },
      });
    },
    async findBySlug(slug) {
      return database.article.findUnique({
        select: articleDetailSelect,
        where: {
          slug,
        },
      });
    },
    async findCategoryById(id) {
      return database.category.findUnique({
        select: {
          id: true,
        },
        where: {
          id,
        },
      });
    },
    async findManyWithPagination({ categoryId, keyword, skip, status, take }) {
      return database.article.findMany({
        orderBy: [
          {
            updatedAt: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
        select: articleListSelect,
        skip,
        take,
        where: buildArticleWhere({
          categoryId,
          keyword,
          status,
        }),
      });
    },
    async findTagsByIds(ids) {
      return database.tag.findMany({
        select: {
          id: true,
        },
        where: {
          id: {
            in: ids,
          },
        },
      });
    },
    async update(id, data) {
      const { tagIds, ...articleData } = data;

      return database.$transaction(async (transaction) => {
        await transaction.article.update({
          data: articleData,
          where: {
            id,
          },
        });

        if (tagIds !== undefined) {
          await transaction.articleTag.deleteMany({
            where: {
              articleId: id,
            },
          });

          if (tagIds.length > 0) {
            await transaction.articleTag.createMany({
              data: tagIds.map((tagId) => ({
                articleId: id,
                tagId,
              })),
            });
          }
        }

        return transaction.article.findUniqueOrThrow({
          select: articleDetailSelect,
          where: {
            id,
          },
        });
      });
    },
  };
}
