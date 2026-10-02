"use client";

import { useEffect, useRef, useState } from "react";

import type {
  CommentItem,
  CommentList,
  CommentStatus,
  CommentSummary,
} from "@/lib/comments/schema";

import { AdminRequestError, usePostQuery } from "./use-posts";

export async function commentRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/admin/comments${path}`, {
    ...init,
    cache: "no-store",
    credentials: "same-origin",
  });
  let body;
  try {
    body = await response.json();
  } catch {
    throw new AdminRequestError("无法读取评论服务响应，请重试。", "INVALID_RESPONSE");
  }
  if (!body || typeof body !== "object")
    throw new AdminRequestError("无法读取评论服务响应，请重试。", "INVALID_RESPONSE");
  if (!response.ok)
    throw new AdminRequestError(
      body.error?.message ?? "评论请求失败，请稍后重试。",
      body.error?.code ?? "REQUEST_FAILED",
      body.error?.fieldErrors,
    );
  if (!("data" in body))
    throw new AdminRequestError("服务响应缺少评论数据，请重试。", "INVALID_RESPONSE");
  return body.data;
}
export function useCommentList(
  filters: { q?: string; status?: string; postId?: string; page?: number; pageSize?: number },
  revision: number,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters))
    if (value !== undefined && value !== "" && value !== "all") params.set(key, String(value));
  return usePostQuery(`?${params}`, revision, commentRequest<CommentList>);
}
export function useComments(postRevision: number, onMessage: (message: string) => void) {
  const [commentRevision, setRevision] = useState(0);
  const summary = usePostQuery(
    "/summary",
    postRevision + commentRevision,
    commentRequest<CommentSummary>,
  );
  const [commentPending, setPending] = useState(false);
  const mutation = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const mutate = async <T>(work: () => Promise<T>, success: string) => {
    if (mutation.current) throw new Error("请等待当前评论操作完成。");
    mutation.current = true;
    setPending(true);
    try {
      const result = await work();
      if (mounted.current) {
        setRevision((value) => value + 1);
        onMessage(success);
      }
      return result;
    } finally {
      mutation.current = false;
      if (mounted.current) setPending(false);
    }
  };
  return {
    commentRevision: commentRevision + postRevision,
    commentSummary: summary.data,
    commentSummaryLoading: summary.loading,
    commentSummaryError: summary.error,
    reloadCommentSummary: summary.reload,
    commentPending,
    moderateComment: (comment: CommentItem, status: Exclude<CommentStatus, "pending">) =>
      mutate(
        () =>
          commentRequest<CommentItem>(`/${comment.id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status, version: comment.version }),
          }),
        status === "approved" ? "评论已通过审核" : "评论及其回复已标记为垃圾",
      ),
    replyComment: (comment: CommentItem, content: string) =>
      mutate(
        () =>
          commentRequest<CommentItem>(`/${comment.id}/replies`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content, version: comment.version }),
          }),
        "回复已保存",
      ),
    deleteComment: (comment: CommentItem) =>
      mutate(
        () =>
          commentRequest<{ id: string }>(`/${comment.id}?version=${comment.version}`, {
            method: "DELETE",
          }),
        "评论及其回复已永久删除",
      ),
  };
}
