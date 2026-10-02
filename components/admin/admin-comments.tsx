"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageCircle,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group";
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  COMMENT_MAX_LENGTH,
  commentStatusLabels,
  type CommentItem,
  type CommentStatus,
} from "@/lib/comments/schema";
import { postTime } from "@/lib/posts/schema";

import { useAdminWorkspace } from "./admin-context";
import { CommentQueryStatus } from "./comment-status";
import { commentRequest, useCommentList } from "./use-comments";
import { AdminRequestError, useDebouncedPostQuery } from "./use-posts";
import "./admin-data-workspace.css";
import "./admin-comments.css";

const filters: { value: "all" | CommentStatus; label: string }[] = [
  { value: "pending", label: "待审核" },
  { value: "approved", label: "已发布" },
  { value: "rejected", label: "垃圾/拦截" },
  { value: "all", label: "全部" },
];
const pageSize = 8;

export function AdminComments() {
  const {
    commentRevision,
    commentPending,
    commentSummary,
    moderateComment,
    replyComment,
    onDeleteComment,
    reloadCommentSummary,
  } = useAdminWorkspace();
  const searchRef = useRef<HTMLInputElement>(null);
  const replyFocus = useRef<HTMLElement | null>(null);
  const [status, setStatus] = useState<string>("pending");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [targetComment, setTargetComment] = useState<CommentItem | null>(null);
  const [reply, setReply] = useState("");
  const [replyError, setReplyError] = useState("");
  const [replyConflict, setReplyConflict] = useState(false);
  const [replyReloading, setReplyReloading] = useState(false);
  const [actionError, setActionError] = useState("");
  const term = useDebouncedPostQuery(query);
  const list = useCommentList({ q: term, status, page, pageSize }, commentRevision);
  const visibleComments = list.data?.items ?? [];
  const total = list.data?.total ?? 0;
  const currentPage = list.data?.page ?? 1;
  const pageCount = list.data?.pageCount ?? 1;
  const counts = list.data?.statusCounts ?? commentSummary?.statusCounts;
  const start = (currentPage - 1) * pageSize;
  const busy = commentPending || replyReloading;
  const actionsDisabled = busy || list.loading || Boolean(list.error) || query.trim() !== term;
  const resetFilters = () => {
    setStatus("all");
    setQuery("");
    setPage(1);
    searchRef.current?.focus();
  };
  const moderate = async (comment: CommentItem, nextStatus: "approved" | "rejected") => {
    setActionError("");
    try {
      await moderateComment(comment, nextStatus);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "审核失败，请重试。");
      if (
        error instanceof AdminRequestError &&
        ["VERSION_CONFLICT", "NOT_FOUND"].includes(error.code)
      ) {
        list.reload();
        reloadCommentSummary();
      }
    }
  };
  const saveReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!targetComment || busy || replyConflict) return;
    setReplyError("");
    try {
      await replyComment(targetComment, reply);
      setTargetComment(null);
      setReply("");
    } catch (error) {
      setReplyError(error instanceof Error ? error.message : "回复保存失败，请重试。");
      setReplyConflict(
        error instanceof AdminRequestError &&
          ["VERSION_CONFLICT", "NOT_FOUND"].includes(error.code),
      );
    }
  };

  return (
    <div className="admin-posts admin-data-page admin-comments admin-comments-page">
      <div className="admin-page-heading">
        <div>
          <h1>评论管理</h1>
          <p>审核留言、回复读者与处理垃圾评论。</p>
        </div>
      </div>
      <div className="admin-data-workspace">
        <Tabs
          value={status}
          onValueChange={(value) => {
            setStatus(String(value));
            setPage(1);
          }}
        >
          <div className="admin-post-filters">
            <div className="admin-post-tabs-scroll">
              <TabsList size="compact" aria-label="按评论状态筛选">
                {filters.map((filter) => (
                  <TabsTrigger key={filter.value} value={filter.value}>
                    {filter.label} ({counts?.[filter.value] ?? "—"})
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <div className="admin-comments-search-controls">
              <InputGroup size="compact" className="admin-post-search">
                <InputGroupInput
                  ref={searchRef}
                  aria-label="搜索评论内容、留言者、邮箱或文章"
                  value={query}
                  maxLength={200}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="搜索评论内容、留言者或文章…"
                />
                <InputGroupAddon>
                  <Search size={16} aria-hidden="true" />
                </InputGroupAddon>
              </InputGroup>
              {query && (
                <Button
                  size="compact"
                  variant="ghost"
                  onClick={() => {
                    setQuery("");
                    setPage(1);
                    searchRef.current?.focus();
                  }}
                >
                  清除搜索
                </Button>
              )}
              <Button
                size="compact"
                variant="ghost"
                disabled={busy || list.loading}
                onClick={() => {
                  list.reload();
                  reloadCommentSummary();
                }}
              >
                刷新
              </Button>
            </div>
          </div>
          <TabsPanel value={status} className="admin-post-panel">
            <div className="admin-post-list" aria-busy={list.loading}>
              <CommentQueryStatus loading={list.loading} error={list.error} reload={list.reload} />
              {actionError && (
                <p className="admin-post-error admin-post-feedback" role="alert">
                  {actionError}
                </p>
              )}
              <section className="admin-post-table-scroll" aria-label="评论列表，可横向滚动">
                <table className="admin-post-table admin-comments-table">
                  <caption className="sr-only">
                    评论列表，共 {total} 条，第 {currentPage} 页
                  </caption>
                  <colgroup>
                    <col />
                    <col />
                    <col />
                    <col />
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="col">评论者</th>
                      <th scope="col">评论内容</th>
                      <th scope="col">状态</th>
                      <th scope="col">快捷审核与回复</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleComments.map((comment) => (
                      <tr key={comment.id}>
                        <td>
                          <div className="admin-comments-author">
                            {comment.isAdmin ? (
                              <Image src="/avatar.avif" width={32} height={32} alt="" />
                            ) : (
                              <span className="admin-comments-avatar" aria-hidden="true">
                                {comment.author.slice(0, 1)}
                              </span>
                            )}
                            <div>
                              <strong>
                                {comment.author}
                                {comment.isAdmin ? "（博主）" : ""}
                              </strong>
                              <span title={comment.email ?? undefined}>{comment.email ?? "—"}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          {comment.parent && (
                            <p className="admin-comments-meta">
                              回复 @{comment.parent.author} · 上级评论
                              {commentStatusLabels[comment.parent.status]}
                            </p>
                          )}
                          <p className="admin-comments-text">{comment.content}</p>
                          <div className="admin-comments-meta">
                            <FileText size={13} aria-hidden="true" />
                            <span>《{comment.postTitle}》</span>
                            <time dateTime={comment.createdAt}>{postTime(comment.createdAt)}</time>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`admin-post-status ${comment.status === "approved" ? "is-published" : comment.status === "rejected" ? "is-rejected" : ""}`}
                          >
                            {commentStatusLabels[comment.status]}
                          </span>
                        </td>
                        <td>
                          <div className="admin-comments-actions">
                            {comment.status !== "approved" && (
                              <Button
                                variant="secondary"
                                size="compact"
                                title="通过审核"
                                aria-label={`通过 ${comment.author} 的评论`}
                                disabled={actionsDisabled}
                                onClick={() => void moderate(comment, "approved")}
                              >
                                <Check size={16} />
                              </Button>
                            )}
                            {comment.status !== "rejected" && (
                              <Button
                                variant="ghost"
                                size="compact"
                                title="标记为垃圾评论"
                                aria-label={`标记 ${comment.author} 的评论为垃圾`}
                                disabled={actionsDisabled}
                                onClick={() => void moderate(comment, "rejected")}
                              >
                                <X size={16} />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="compact"
                              title={
                                comment.status === "approved" ? "回复评论" : "请先通过审核再回复"
                              }
                              aria-label={`回复 ${comment.author} 的评论`}
                              disabled={actionsDisabled || comment.status !== "approved"}
                              onClick={(event) => {
                                replyFocus.current = event.currentTarget;
                                setTargetComment(comment);
                                setReply("");
                                setReplyError("");
                                setReplyConflict(false);
                              }}
                            >
                              <MessageCircle size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="compact"
                              title="删除评论"
                              aria-label={`删除 ${comment.author} 的评论`}
                              disabled={actionsDisabled}
                              onClick={() => onDeleteComment(comment, searchRef.current)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
              {!list.loading && !list.error && !total && (
                <div className="admin-post-empty">
                  <MessageCircle size={32} aria-hidden="true" />
                  <h2>{term ? "未匹配到相关评论" : "暂无对应状态的评论"}</h2>
                  <p>{term ? "请调整状态或搜索关键词。" : "可以切换状态查看其他读者留言。"}</p>
                  <Button variant="secondary" size="compact" onClick={resetFilters}>
                    查看全部评论
                  </Button>
                </div>
              )}
              <div className="admin-post-pagination">
                <span aria-live="polite">
                  显示第 {total ? start + 1 : 0}–{Math.min(start + pageSize, total)} 条，共 {total}{" "}
                  条
                </span>
                <nav aria-label="评论分页">
                  <Button
                    size="compact"
                    variant="ghost"
                    aria-label="上一页"
                    disabled={list.loading || Boolean(list.error) || currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    <ChevronLeft size={17} />
                  </Button>
                  <span aria-current="page">
                    {currentPage} / {pageCount}
                  </span>
                  <Button
                    size="compact"
                    variant="ghost"
                    aria-label="下一页"
                    disabled={list.loading || Boolean(list.error) || currentPage === pageCount}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    <ChevronRight size={17} />
                  </Button>
                </nav>
              </div>
            </div>
          </TabsPanel>
        </Tabs>
      </div>
      <p className="admin-post-session-note">
        评论与回复已保存到数据库；待审核评论须先通过审核才能回复。本阶段不发送邮件或通知。
      </p>
      <Dialog
        open={targetComment !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setTargetComment(null);
        }}
      >
        <DialogContent
          className="admin-modal admin-comments-reply"
          finalFocus={() =>
            replyFocus.current?.isConnected ? replyFocus.current : (searchRef.current ?? true)
          }
        >
          <div className="admin-modal-heading">
            <div>
              <DialogTitle>回复 @{targetComment?.author}</DialogTitle>
              <DialogDescription>回复会保存到该文章下，并关联原评论。</DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              aria-label="关闭回复"
              disabled={busy}
              onClick={() => setTargetComment(null)}
            >
              <X size={18} />
            </Button>
          </div>
          {targetComment && (
            <blockquote className="admin-comments-quote">
              <p>{targetComment.content}</p>
              <cite>《{targetComment.postTitle}》</cite>
            </blockquote>
          )}
          <form className="admin-form" onSubmit={saveReply}>
            <label htmlFor="admin-comment-reply">
              博主回复
              <Textarea
                id="admin-comment-reply"
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                rows={5}
                maxLength={COMMENT_MAX_LENGTH}
                disabled={busy}
                aria-invalid={Boolean(replyError)}
                aria-describedby={replyError ? "admin-comment-reply-error" : undefined}
                required
                placeholder="输入你的回复内容…"
              />
            </label>
            {replyError && (
              <p id="admin-comment-reply-error" className="admin-post-error" role="alert">
                {replyError}
              </p>
            )}
            {replyConflict && (
              <Button
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={async () => {
                  if (!targetComment) return;
                  setReplyReloading(true);
                  try {
                    const latest = await commentRequest<CommentItem>(`/${targetComment.id}`);
                    setTargetComment(latest);
                    setReplyConflict(latest.status !== "approved");
                    setReplyError(
                      latest.status === "approved"
                        ? "已载入原评论的最新状态，回复草稿已保留。请确认后提交。"
                        : "原评论尚未通过审核，请先处理审核状态，再重新载入。",
                    );
                    list.reload();
                    reloadCommentSummary();
                  } catch (error) {
                    setReplyError(error instanceof Error ? error.message : "重新载入失败。");
                  } finally {
                    setReplyReloading(false);
                  }
                }}
              >
                重新载入原评论，保留草稿
              </Button>
            )}
            <div className="admin-form-actions">
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => setTargetComment(null)}
              >
                取消
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={
                  busy || replyConflict || !reply.trim() || targetComment?.status !== "approved"
                }
              >
                {commentPending ? "正在保存…" : "保存回复"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
