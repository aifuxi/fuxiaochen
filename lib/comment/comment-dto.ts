import { CommentStatus } from "@/generated/prisma/enums";
import { z } from "zod";

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
  status: (typeof CommentStatus)[keyof typeof CommentStatus];
  updatedAt: Date;
};

const commentStatusSchema = z.enum([
  CommentStatus.Approved,
  CommentStatus.Deleted,
  CommentStatus.Pending,
  CommentStatus.Spam,
]);

const normalizedStringIdSchema = z
  .string({
    error: "Comment id must be a string.",
  })
  .trim()
  .min(1, "Comment id is required.")
  .max(191, "Comment id is too long.");

const normalizedRelationIdSchema = z.preprocess((value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  return value;
}, z.string().max(191, "Relation id is too long.").nullable().optional());

const normalizedTextSchema = z.preprocess((value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  return value;
}, z.string().nullable().optional());

const normalizedColorSchema = z.preprocess((value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  return value;
}, z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Avatar color must be a valid hex color.").nullable().optional());

const normalizedDateSchema = z.preprocess((value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }

  return value;
}, z.date().nullable().optional());

export const commentIdSchema = normalizedStringIdSchema;

export const listCommentsQuerySchema = z.object({
  articleId: normalizedRelationIdSchema,
  keyword: z
    .string()
    .trim()
    .transform((value) => value || undefined)
    .optional(),
  page: z.coerce
    .number({
      error: "Page must be a number.",
    })
    .int("Page must be an integer.")
    .min(1, "Page must be at least 1.")
    .default(1),
  pageSize: z.coerce
    .number({
      error: "Page size must be a number.",
    })
    .int("Page size must be an integer.")
    .min(1, "Page size must be at least 1.")
    .max(50, "Page size must not exceed 50.")
    .default(10),
  status: commentStatusSchema.optional(),
});

export const createCommentBodySchema = z.object({
  approvedAt: normalizedDateSchema,
  articleId: normalizedStringIdSchema,
  authorAvatarColor: normalizedColorSchema,
  authorAvatarInitials: normalizedTextSchema.pipe(z.string().max(8, "Avatar initials must not exceed 8 characters.").nullable().optional()),
  authorEmail: normalizedTextSchema.pipe(z.email("Author email must be a valid email address.").nullable().optional()),
  authorName: z.string().trim().min(1, "Author name is required.").max(100, "Author name must not exceed 100 characters."),
  body: z.string().trim().min(1, "Comment body is required.").max(10000, "Comment body is too long."),
  parentCommentId: normalizedRelationIdSchema,
  status: commentStatusSchema.default(CommentStatus.Pending),
});

export const updateCommentBodySchema = z
  .object({
    approvedAt: normalizedDateSchema,
    articleId: normalizedRelationIdSchema,
    authorAvatarColor: normalizedColorSchema,
    authorAvatarInitials: normalizedTextSchema.pipe(z.string().max(8, "Avatar initials must not exceed 8 characters.").nullable().optional()),
    authorEmail: normalizedTextSchema.pipe(z.email("Author email must be a valid email address.").nullable().optional()),
    authorName: z.string().trim().min(1, "Author name is required.").max(100, "Author name must not exceed 100 characters.").optional(),
    body: z.string().trim().min(1, "Comment body is required.").max(10000, "Comment body is too long.").optional(),
    parentCommentId: normalizedRelationIdSchema,
    status: commentStatusSchema.optional(),
  })
  .refine(
    (value) =>
      value.approvedAt !== undefined ||
      value.articleId !== undefined ||
      value.authorAvatarColor !== undefined ||
      value.authorAvatarInitials !== undefined ||
      value.authorEmail !== undefined ||
      value.authorName !== undefined ||
      value.body !== undefined ||
      value.parentCommentId !== undefined ||
      value.status !== undefined,
    {
      message: "At least one field must be provided.",
      path: [],
    },
  );

export type CommentArticleDto = {
  id: string;
  slug: string;
  title: string;
};

export type CommentDto = {
  approvedAt: string | null;
  article: CommentArticleDto;
  articleId: string;
  authorAvatarColor: string | null;
  authorAvatarInitials: string | null;
  authorEmail: string | null;
  authorName: string;
  body: string;
  createdAt: string;
  id: string;
  parentCommentId: string | null;
  repliesCount: number;
  replyDepth: number;
  status: (typeof CommentStatus)[keyof typeof CommentStatus];
  updatedAt: string;
};

export type CreateCommentInput = z.infer<typeof createCommentBodySchema>;
export type ListCommentsQuery = z.infer<typeof listCommentsQuerySchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentBodySchema>;

export function toCommentDto(comment: CommentRecord): CommentDto {
  return {
    approvedAt: comment.approvedAt?.toISOString() ?? null,
    article: {
      id: comment.article.id,
      slug: comment.article.slug,
      title: comment.article.title,
    },
    articleId: comment.articleId,
    authorAvatarColor: comment.authorAvatarColor,
    authorAvatarInitials: comment.authorAvatarInitials,
    authorEmail: comment.authorEmail,
    authorName: comment.authorName,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    id: comment.id,
    parentCommentId: comment.parentCommentId,
    repliesCount: comment._count.replies,
    replyDepth: comment.replyDepth,
    status: comment.status,
    updatedAt: comment.updatedAt.toISOString(),
  };
}
