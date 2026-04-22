import type { CommentStatus } from "@/lib/db/schema";

import type { CommentReadModel, CommentStats } from "./service";

export type PublicComment = {
  id: string;
  author: string;
  content: string;
  avatar: string | null;
  createdAt: string;
  parentId: string | null;
};

export type AdminComment = {
  id: string;
  author: string;
  email: string;
  content: string;
  avatar: string | null;
  status: CommentStatus;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  blog: CommentReadModel["blog"];
};

export type AdminCommentListPayload = {
  items: AdminComment[];
  stats: CommentStats;
};

export type PublicCommentCreateResult = {
  id: string;
  status: CommentStatus;
};

export function toPublicComment(comment: CommentReadModel): PublicComment {
  return {
    id: comment.id,
    author: comment.author,
    content: comment.content,
    avatar: comment.avatar,
    createdAt: comment.createdAt.toISOString(),
    parentId: comment.parentId,
  };
}

export function toAdminComment(comment: CommentReadModel): AdminComment {
  return {
    id: comment.id,
    author: comment.author,
    email: comment.email,
    content: comment.content,
    avatar: comment.avatar,
    status: comment.status,
    parentId: comment.parentId,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    blog: comment.blog,
  };
}

export function toPublicCommentCreateResult(
  comment: CommentReadModel,
): PublicCommentCreateResult {
  return {
    id: comment.id,
    status: comment.status,
  };
}
