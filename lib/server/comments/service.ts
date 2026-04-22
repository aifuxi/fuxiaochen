import { generateCuid } from "@/lib/cuid";
import type { Blog, Comment as DbComment, NewComment } from "@/lib/db/schema";
import type {
  AdminCommentListQuery,
  AdminCommentUpdateInput,
  PublicCommentCreateInput,
  PublicCommentListQuery,
} from "@/lib/server/comments/dto";
import { ERROR_CODES } from "@/lib/server/http/error-codes";
import { AppError } from "@/lib/server/http/errors";

import { commentRepository } from "./repository";

export type CommentBlogSummary = Pick<Blog, "id" | "slug" | "title">;

export type CommentReadModel = DbComment & {
  blog: CommentBlogSummary | null;
};

export type CommentStats = {
  total: number;
  pending: number;
  approved: number;
  spam: number;
};

type CommentUpdateMutation = Partial<
  Pick<NewComment, "author" | "email" | "content" | "status" | "avatar">
> & {
  updatedAt: Date;
};

type PublicBlogLookup = Pick<Blog, "id" | "slug" | "title" | "published">;

export interface CommentRepository {
  listAdmin(query: AdminCommentListQuery): Promise<{
    items: CommentReadModel[];
    total: number;
  }>;
  listPublicByPostSlug(postSlug: string): Promise<CommentReadModel[]>;
  getStats(): Promise<CommentStats>;
  findById(id: string): Promise<CommentReadModel | null>;
  findPublicBlogBySlug(slug: string): Promise<PublicBlogLookup | null>;
  create(comment: NewComment): Promise<CommentReadModel>;
  update(
    id: string,
    comment: CommentUpdateMutation,
  ): Promise<CommentReadModel | null>;
  delete(id: string): Promise<boolean>;
}

export interface CommentService {
  listAdminComments(query: AdminCommentListQuery): Promise<{
    items: CommentReadModel[];
    total: number;
    stats: CommentStats;
  }>;
  listPublicComments(
    query: PublicCommentListQuery,
  ): Promise<CommentReadModel[]>;
  createPublicComment(
    input: PublicCommentCreateInput,
  ): Promise<CommentReadModel>;
  updateComment(
    id: string,
    input: AdminCommentUpdateInput,
  ): Promise<CommentReadModel>;
  deleteComment(id: string): Promise<void>;
}

export interface CommentServiceDeps {
  repository?: CommentRepository;
  now?: () => Date;
  generateId?: () => string;
}

const createCommentNotFoundError = (id: string) =>
  new AppError(ERROR_CODES.COMMENT_NOT_FOUND, "Comment not found", 404, {
    id,
  });

const createBlogNotFoundError = (postSlug: string) =>
  new AppError(
    ERROR_CODES.COMMENT_BLOG_NOT_FOUND,
    "Comment blog not found",
    404,
    {
      postSlug,
    },
  );

const createParentNotFoundError = (parentId: string) =>
  new AppError(
    ERROR_CODES.COMMENT_PARENT_NOT_FOUND,
    "Parent comment not found",
    404,
    {
      parentId,
    },
  );

const createParentMismatchError = (parentId: string, postSlug: string) =>
  new AppError(
    ERROR_CODES.COMMENT_PARENT_MISMATCH,
    "Parent comment does not belong to this post",
    400,
    {
      parentId,
      postSlug,
    },
  );

async function validateParentComment({
  repository,
  parentId,
  blogId,
  postSlug,
}: {
  repository: CommentRepository;
  parentId?: string;
  blogId: string;
  postSlug: string;
}) {
  if (!parentId) {
    return null;
  }

  const parentComment = await repository.findById(parentId);

  if (!parentComment) {
    throw createParentNotFoundError(parentId);
  }

  if (parentComment.blogId !== blogId) {
    throw createParentMismatchError(parentId, postSlug);
  }

  return parentComment;
}

export function createCommentService({
  repository = commentRepository,
  now = () => new Date(),
  generateId = generateCuid,
}: CommentServiceDeps = {}): CommentService {
  return {
    async listAdminComments(query) {
      const [result, stats] = await Promise.all([
        repository.listAdmin(query),
        repository.getStats(),
      ]);

      return {
        items: result.items,
        total: result.total,
        stats,
      };
    },
    listPublicComments(query) {
      return repository.listPublicByPostSlug(query.postSlug);
    },
    async createPublicComment(input) {
      const blog = await repository.findPublicBlogBySlug(input.postSlug);

      if (!blog || !blog.published) {
        throw createBlogNotFoundError(input.postSlug);
      }

      await validateParentComment({
        repository,
        parentId: input.parentId,
        blogId: blog.id,
        postSlug: input.postSlug,
      });

      const timestamp = now();
      const comment: NewComment = {
        id: generateId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        blogId: blog.id,
        parentId: input.parentId ?? null,
        author: input.author,
        email: input.email,
        content: input.content,
        avatar: null,
        status: "pending",
      };

      return repository.create(comment);
    },
    async updateComment(id, input) {
      const existingComment = await repository.findById(id);

      if (!existingComment) {
        throw createCommentNotFoundError(id);
      }

      const updatedComment = await repository.update(id, {
        ...input,
        updatedAt: now(),
      });

      if (!updatedComment) {
        throw createCommentNotFoundError(id);
      }

      return updatedComment;
    },
    async deleteComment(id) {
      const deleted = await repository.delete(id);

      if (!deleted) {
        throw createCommentNotFoundError(id);
      }
    },
  };
}
