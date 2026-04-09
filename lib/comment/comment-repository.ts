import { type Prisma, type PrismaClient } from "@/generated/prisma/client";
import type { CommentStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import type { ListCommentsQuery } from "@/lib/comment/comment-dto";

type CommentArticleRecord = {
  id: string;
  slug: string;
  title: string;
};

type CommentRecord = {
  _count: {
    replies: number;
  };
  approvedAt: Date | null;
  article: CommentArticleRecord;
  articleId: string;
  authorAvatarColor: string | null;
  authorAvatarInitials: string | null;
  authorEmail: string | null;
  authorName: string;
  body: string;
  createdAt: Date;
  id: string;
  parentCommentId: string | null;
  replyDepth: number;
  status: CommentStatus;
  updatedAt: Date;
};

type ParentCommentRecord = {
  articleId: string;
  id: string;
  replyDepth: number;
};

type CommentCreateData = {
  approvedAt?: Date | null;
  articleId: string;
  authorAvatarColor?: string | null;
  authorAvatarInitials?: string | null;
  authorEmail?: string | null;
  authorName: string;
  body: string;
  parentCommentId?: string | null;
  replyDepth: number;
  status: CommentStatus;
};

type CommentUpdateData = {
  approvedAt?: Date | null;
  articleId?: string;
  authorAvatarColor?: string | null;
  authorAvatarInitials?: string | null;
  authorEmail?: string | null;
  authorName?: string;
  body?: string;
  parentCommentId?: string | null;
  replyDepth?: number;
  status?: CommentStatus;
};

type FindManyOptions = ListCommentsQuery & {
  skip: number;
  take: number;
};

export type CommentRepository = {
  countByFilters: (filters: ListCommentsQuery) => Promise<number>;
  create: (data: CommentCreateData) => Promise<CommentRecord>;
  delete: (id: string) => Promise<void>;
  findArticleById: (id: string) => Promise<{ id: string } | null>;
  findById: (id: string) => Promise<CommentRecord | null>;
  findManyWithPagination: (options: FindManyOptions) => Promise<CommentRecord[]>;
  findParentById: (id: string) => Promise<ParentCommentRecord | null>;
  syncArticleCommentCount: (articleId: string) => Promise<void>;
  update: (id: string, data: CommentUpdateData) => Promise<CommentRecord>;
};

const commentArticleSelect = {
  id: true,
  slug: true,
  title: true,
} satisfies Prisma.ArticleSelect;

const commentSelect = {
  _count: {
    select: {
      replies: true,
    },
  },
  approvedAt: true,
  article: {
    select: commentArticleSelect,
  },
  articleId: true,
  authorAvatarColor: true,
  authorAvatarInitials: true,
  authorEmail: true,
  authorName: true,
  body: true,
  createdAt: true,
  id: true,
  parentCommentId: true,
  replyDepth: true,
  status: true,
  updatedAt: true,
} satisfies Prisma.CommentSelect;

function buildCommentWhere(filters: Pick<ListCommentsQuery, "articleId" | "keyword" | "status">): Prisma.CommentWhereInput {
  return {
    ...(filters.articleId ? { articleId: filters.articleId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.keyword
      ? {
          OR: [
            {
              authorName: {
                contains: filters.keyword,
              },
            },
            {
              authorEmail: {
                contains: filters.keyword,
              },
            },
            {
              body: {
                contains: filters.keyword,
              },
            },
          ],
        }
      : {}),
  };
}

export function createCommentRepository(database: PrismaClient = prisma): CommentRepository {
  return {
    async countByFilters(filters) {
      return database.comment.count({
        where: buildCommentWhere(filters),
      });
    },
    async create(data) {
      return database.comment.create({
        data,
        select: commentSelect,
      });
    },
    async delete(id) {
      await database.comment.delete({
        where: {
          id,
        },
      });
    },
    async findArticleById(id) {
      return database.article.findUnique({
        select: {
          id: true,
        },
        where: {
          id,
        },
      });
    },
    async findById(id) {
      return database.comment.findUnique({
        select: commentSelect,
        where: {
          id,
        },
      });
    },
    async findManyWithPagination({ articleId, keyword, skip, status, take }) {
      return database.comment.findMany({
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
        select: commentSelect,
        skip,
        take,
        where: buildCommentWhere({
          articleId,
          keyword,
          status,
        }),
      });
    },
    async findParentById(id) {
      return database.comment.findUnique({
        select: {
          articleId: true,
          id: true,
          replyDepth: true,
        },
        where: {
          id,
        },
      });
    },
    async syncArticleCommentCount(articleId) {
      const count = await database.comment.count({
        where: {
          articleId,
        },
      });

      await database.article.update({
        data: {
          commentCount: count,
        },
        where: {
          id: articleId,
        },
      });
    },
    async update(id, data) {
      return database.comment.update({
        data,
        select: commentSelect,
        where: {
          id,
        },
      });
    },
  };
}
