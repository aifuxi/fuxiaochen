import { ApiError } from "@/lib/api/api-error";
import { commentErrorCodes } from "@/lib/api/error-codes";
import type { CreateCommentInput, ListCommentsQuery, UpdateCommentInput } from "@/lib/comment/comment-dto";
import { toCommentDto } from "@/lib/comment/comment-dto";
import type { CommentRepository } from "@/lib/comment/comment-repository";
import { CommentStatus } from "@/generated/prisma/enums";

type ListCommentsResult = {
  items: ReturnType<typeof toCommentDto>[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type CommentService = {
  createComment: (input: CreateCommentInput) => Promise<ReturnType<typeof toCommentDto>>;
  deleteComment: (id: string) => Promise<{ id: string }>;
  getCommentById: (id: string) => Promise<ReturnType<typeof toCommentDto>>;
  listComments: (query: ListCommentsQuery) => Promise<ListCommentsResult>;
  updateComment: (id: string, input: UpdateCommentInput) => Promise<ReturnType<typeof toCommentDto>>;
};

export function createCommentService(repository: CommentRepository): CommentService {
  return {
    async createComment(input) {
      await ensureArticleExists(repository, input.articleId);
      const parentComment = await ensureParentCommentValid(repository, input.parentCommentId, input.articleId);
      const comment = await repository.create({
        ...input,
        approvedAt: normalizeApprovedAt(input.status, input.approvedAt),
        replyDepth: parentComment ? parentComment.replyDepth + 1 : 0,
      });

      await repository.syncArticleCommentCount(input.articleId);

      return toCommentDto(comment);
    },
    async deleteComment(id) {
      const existingComment = await getExistingComment(repository, id);
      await repository.delete(id);
      await repository.syncArticleCommentCount(existingComment.articleId);

      return { id };
    },
    async getCommentById(id) {
      const comment = await getExistingComment(repository, id);

      return toCommentDto(comment);
    },
    async listComments(query) {
      const skip = (query.page - 1) * query.pageSize;
      const [items, total] = await Promise.all([
        repository.findManyWithPagination({
          ...query,
          skip,
          take: query.pageSize,
        }),
        repository.countByFilters(query),
      ]);

      return {
        items: items.map(toCommentDto),
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / query.pageSize),
      };
    },
    async updateComment(id, input) {
      const existingComment = await getExistingComment(repository, id);
      const nextArticleId = input.articleId ?? existingComment.articleId;

      await ensureArticleExists(repository, nextArticleId);
      const parentComment = await ensureParentCommentValid(
        repository,
        input.parentCommentId !== undefined ? input.parentCommentId : existingComment.parentCommentId,
        nextArticleId,
        id,
      );

      const updatedComment = await repository.update(id, {
        ...input,
        approvedAt: normalizeApprovedAt(input.status ?? existingComment.status, input.approvedAt, existingComment.approvedAt),
        articleId: nextArticleId,
        parentCommentId: input.parentCommentId !== undefined ? input.parentCommentId : existingComment.parentCommentId,
        replyDepth: parentComment ? parentComment.replyDepth + 1 : 0,
      });

      await repository.syncArticleCommentCount(existingComment.articleId);

      if (nextArticleId !== existingComment.articleId) {
        await repository.syncArticleCommentCount(nextArticleId);
      }

      return toCommentDto(updatedComment);
    },
  };
}

async function ensureArticleExists(repository: CommentRepository, articleId: string) {
  const article = await repository.findArticleById(articleId);

  if (!article) {
    throw new ApiError({
      code: commentErrorCodes.COMMENT_ARTICLE_NOT_FOUND,
      message: "Article does not exist.",
    });
  }
}

async function ensureParentCommentValid(
  repository: CommentRepository,
  parentCommentId: string | null | undefined,
  articleId: string,
  currentId?: string,
) {
  if (!parentCommentId) {
    return null;
  }

  if (parentCommentId === currentId) {
    throw new ApiError({
      code: commentErrorCodes.COMMENT_SELF_PARENT,
      message: "Comment cannot be its own parent.",
    });
  }

  const parentComment = await repository.findParentById(parentCommentId);

  if (!parentComment) {
    throw new ApiError({
      code: commentErrorCodes.COMMENT_PARENT_NOT_FOUND,
      message: "Parent comment does not exist.",
    });
  }

  if (parentComment.articleId !== articleId) {
    throw new ApiError({
      code: commentErrorCodes.COMMENT_PARENT_ARTICLE_MISMATCH,
      message: "Parent comment must belong to the same article.",
    });
  }

  return parentComment;
}

async function getExistingComment(repository: CommentRepository, id: string) {
  const comment = await repository.findById(id);

  if (!comment) {
    throw new ApiError({
      code: commentErrorCodes.COMMENT_NOT_FOUND,
      message: "Comment does not exist.",
    });
  }

  return comment;
}

function normalizeApprovedAt(
  status: (typeof CommentStatus)[keyof typeof CommentStatus],
  approvedAt?: Date | null,
  existingApprovedAt?: Date | null,
) {
  if (status === CommentStatus.Approved) {
    return approvedAt ?? existingApprovedAt ?? new Date();
  }

  if (approvedAt !== undefined) {
    return approvedAt;
  }

  return null;
}
