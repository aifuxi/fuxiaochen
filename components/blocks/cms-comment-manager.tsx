"use client";

import NiceModal from "@ebay/nice-modal-react";
import { CommentStatus } from "@/generated/prisma/enums";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, RefreshCw, Search, Trash2 } from "lucide-react";
import React from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";

import { CommentDeleteDialog } from "@/components/modals/comment-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  deleteComment,
  listComments,
  type CommentApiError,
  updateComment,
  type ListCommentsResult,
} from "@/lib/comment/comment-client";
import type { CommentDto } from "@/lib/comment/comment-dto";
import { listArticles } from "@/lib/article/article-client";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_DELAY = 300;
const STATUS_OPTIONS = [
  { label: "全部", value: "" },
  { label: "待审核", value: CommentStatus.Pending },
  { label: "已批准", value: CommentStatus.Approved },
  { label: "垃圾评论", value: CommentStatus.Spam },
  { label: "已删除", value: CommentStatus.Deleted },
];

export function CmsCommentManager() {
  const [page, setPage] = React.useState(1);
  const [searchValue, setSearchValue] = React.useState("");
  const [keyword, setKeyword] = React.useState("");
  const [status, setStatus] = React.useState<(typeof CommentStatus)[keyof typeof CommentStatus] | "">("");
  const [articleId, setArticleId] = React.useState("");

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setKeyword(searchValue.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_DELAY);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchValue]);

  const query = React.useMemo(
    () => ({
      articleId: articleId || undefined,
      keyword: keyword || undefined,
      page,
      pageSize: PAGE_SIZE,
      status: status || undefined,
    }),
    [articleId, keyword, page, status],
  );

  const { data, error, isLoading, isValidating, mutate } = useSWR<ListCommentsResult, CommentApiError>(
    ["comments", query.keyword ?? "", query.status ?? "", query.articleId ?? "", query.page, query.pageSize],
    () => listComments(query),
    {
      keepPreviousData: true,
    },
  );

  const { data: articlesData } = useSWR(["comment-article-options"], () =>
    listArticles({
      page: 1,
      pageSize: 50,
    }),
  );

  const updateMutation = useSWRMutation(
    "update-comment-status",
    (_key, { arg }: { arg: { id: string; status: CommentStatus } }) =>
      updateComment(arg.id, { status: arg.status }),
  );
  const deleteMutation = useSWRMutation(
    "delete-comment",
    (_key, { arg }: { arg: { id: string } }) => deleteComment(arg.id),
  );

  const comments = data?.items ?? [];
  const articles = articlesData?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(data?.totalPages ?? 1, 1);
  const visiblePages = getVisiblePages(page, totalPages);
  const isMutating = updateMutation.isMutating || deleteMutation.isMutating;

  React.useEffect(() => {
    if (!data) {
      return;
    }

    if (page > data.totalPages && data.totalPages > 0) {
      setPage(data.totalPages);
    }
  }, [data, page]);

  async function handleStatusUpdate(comment: CommentDto, nextStatus: CommentStatus) {
    await updateMutation.trigger({
      id: comment.id,
      status: nextStatus,
    });
    toast.success(`已将评论标记为${nextStatus.toLowerCase() === "approved" ? "已批准" : nextStatus.toLowerCase() === "pending" ? "待审核" : nextStatus.toLowerCase() === "spam" ? "垃圾评论" : "已删除"}。`);
    await mutate();
  }

  async function handleDelete(comment: CommentDto) {
    await deleteMutation.trigger({
      id: comment.id,
    });
    toast.success("评论已删除。");

    const nextTotal = Math.max(total - 1, 0);
    const nextTotalPages = Math.max(Math.ceil(nextTotal / PAGE_SIZE), 1);

    if (page > nextTotalPages) {
      setPage(nextTotalPages);

      return;
    }

    await mutate();
  }

  function openDeleteDialog(comment: CommentDto) {
    void NiceModal.show(CommentDeleteDialog, {
      comment,
      onConfirm: () => handleDelete(comment),
    });
  }

  return (
    <div className="space-y-6">
      <div className={`
        flex flex-col gap-4
        lg:flex-row lg:items-center lg:justify-between
      `}>
        <div className={`
          flex flex-1 flex-col gap-3
          lg:flex-row lg:items-center
        `}>
          <div className="w-full max-w-md">
            <Input
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="按作者、邮箱或评论内容搜索"
              startAdornment={<Search className="size-4" />}
              value={searchValue}
            />
          </div>
          <div className="w-full max-w-56">
            <Select
              onValueChange={(value) => {
                setStatus(value as (typeof CommentStatus)[keyof typeof CommentStatus] | "");
                setPage(1);
              }}
              options={STATUS_OPTIONS}
              value={status}
            />
          </div>
          <div className="w-full max-w-72">
            <Select
              onValueChange={(value) => {
                setArticleId(value as string);
                setPage(1);
              }}
              options={[
                { label: "全部文章", value: "" },
                ...articles.map((article) => ({
                  label: article.title,
                  value: article.id,
                })),
              ]}
              value={articleId}
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-muted">
            <Badge variant="muted">{total} 条评论</Badge>
            {isValidating && !isLoading ? <span className="inline-flex items-center gap-2"><RefreshCw className={`
              size-3 animate-spin
            `} /> 刷新中</span> : null}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-2xl border border-white/8 bg-white/4" />
          ))
        ) : error ? (
          <div className="rounded-2xl border border-white/8 bg-white/3 p-8 text-center">
            <p className="text-sm text-muted">{error.message || "加载评论失败。"}</p>
            <Button className="mt-4" onClick={() => void mutate()} variant="outline">
              重试
            </Button>
          </div>
        ) : comments.length === 0 ? (
          <div className="rounded-2xl border border-white/8 bg-white/3 p-12 text-center">
                    <div className={`
                      mx-auto flex size-12 items-center justify-center rounded-xl border border-white/8 bg-white/4
                      text-muted
                    `}>
              <MessageSquare className="size-5" />
            </div>
            <p className="mt-4 text-base text-foreground">
              {keyword || status || articleId ? "没有符合筛选条件的评论。" : "暂无评论。"}
            </p>
            <p className="mt-2 text-sm text-muted">
              {keyword || status || articleId
                ? "尝试不同的筛选组合。"
                : "当读者开始讨论时，评论将显示在这里。"}
            </p>
          </div>
        ) : (
          comments.map((comment, index) => (
            <div
              key={comment.id}
              className={`
                rounded-2xl border p-6
                ${comment.status === CommentStatus.Approved ? "border-l-4 border-white/8 border-l-primary bg-white/3" : comment.status === CommentStatus.Pending ? `
                  border-l-4 border-white/8 border-l-amber-400 bg-white/3
                ` : `border-l-4 border-white/8 border-l-red-500 bg-white/3`}
              `}
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{
                      backgroundColor: comment.authorAvatarColor ?? (index % 2 === 0 ? "#10B981" : "#0EA5E9"),
                    }}
                  >
                    {(comment.authorAvatarInitials || comment.authorName.slice(0, 2)).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{comment.authorName}</div>
                    <div className="text-xs text-muted">{comment.authorEmail || "未提供邮箱"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={getStatusVariant(comment.status)}>{comment.status}</Badge>
                  <span className="text-xs text-muted">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>

              <div className="pl-[52px]">
                <div className={`
                  mb-4 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1 text-xs text-primary
                `}>
                  <span>↳</span>
                  <span>{comment.article.title}</span>
                </div>
                <p className="mb-2 text-sm leading-7 text-foreground">{comment.body}</p>
                <div className="flex flex-wrap gap-2 text-xs text-muted">
                  <span>回复: {comment.repliesCount}</span>
                  <span>深度: {comment.replyDepth}</span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 pl-[52px]">
                {comment.status !== CommentStatus.Approved ? (
                  <Button
                    disabled={isMutating}
                    onClick={() => void handleStatusUpdate(comment, CommentStatus.Approved)}
                    size="sm"
                    variant="ghost"
                  >
                    批准
                  </Button>
                ) : null}
                {comment.status !== CommentStatus.Spam ? (
                  <Button
                    disabled={isMutating}
                    onClick={() => void handleStatusUpdate(comment, CommentStatus.Spam)}
                    size="sm"
                    variant="outline"
                  >
                    标记垃圾
                  </Button>
                ) : null}
                {comment.status !== CommentStatus.Pending ? (
                  <Button
                    disabled={isMutating}
                    onClick={() => void handleStatusUpdate(comment, CommentStatus.Pending)}
                    size="sm"
                    variant="outline"
                  >
                    待审核
                  </Button>
                ) : null}
                <Button
                  disabled={isMutating}
                  onClick={() => openDeleteDialog(comment)}
                  size="sm"
                  variant="outline"
                >
                  <Trash2 className="size-4" />
                  删除
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={`
        flex flex-col gap-4
        sm:flex-row sm:items-center sm:justify-between
      `}>
        <p className="text-sm text-muted">
          {total === 0
            ? "无记录"
            : `显示 ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)}，共 ${total} 条`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            disabled={page === 1 || isLoading}
            onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
            size="sm"
            variant="outline"
          >
            上一页
          </Button>
          {visiblePages.map((item) => (
            <Button
              key={item}
              disabled={isLoading}
              onClick={() => setPage(item)}
              size="sm"
              variant={item === page ? "primary" : "ghost"}
            >
              {item}
            </Button>
          ))}
          <Button
            disabled={page === totalPages || isLoading}
            onClick={() => setPage((currentPage) => Math.min(currentPage + 1, totalPages))}
            size="sm"
            variant="outline"
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  );
}

function getStatusVariant(status: CommentDto["status"]) {
  if (status === CommentStatus.Approved) {
    return "success";
  }

  if (status === CommentStatus.Pending) {
    return "warning";
  }

  if (status === CommentStatus.Spam || status === CommentStatus.Deleted) {
    return "destructive";
  }

  return "muted";
}

function getVisiblePages(page: number, totalPages: number) {
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const startPage = Math.max(1, Math.min(page - 2, totalPages - maxVisiblePages + 1));

  return Array.from({ length: maxVisiblePages }, (_, index) => startPage + index);
}
