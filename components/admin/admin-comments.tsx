"use client";

import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageCircle,
  Search,
  Trash2,
  X,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group";
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import type { CommentStatus } from "./mock-data";

import { useAdminWorkspace } from "./admin-context";
import "./admin-data-workspace.css";
import "./admin-comments.css";

const filters: { value: "all" | CommentStatus; label: string }[] = [
  { value: "待审核", label: "待审核" },
  { value: "已通过", label: "已发布" },
  { value: "已拒绝", label: "垃圾/拦截" },
  { value: "all", label: "全部" },
];
const pageSize = 8;

export function AdminComments() {
  const { comments, onApprove, onReject, onReply, onDeleteComment } = useAdminWorkspace();
  const searchRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string>("待审核");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const targetComment = comments.find((comment) => comment.id === replyId);
  const term = query.trim().toLocaleLowerCase();
  const filtered = comments.filter(
    (comment) =>
      (status === "all" || comment.status === status) &&
      (!term ||
        [comment.author, comment.email, comment.content, comment.postTitle].some((value) =>
          value.toLocaleLowerCase().includes(term),
        )),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const visibleComments = filtered.slice(start, start + pageSize);
  const resetFilters = () => {
    setStatus("all");
    setQuery("");
    setPage(1);
  };
  const saveReply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (replyId && onReply(replyId, reply)) {
      setReplyId(null);
      setReply("");
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
                    {filter.label} (
                    {filter.value === "all"
                      ? comments.length
                      : comments.filter((comment) => comment.status === filter.value).length}
                    )
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
              {term && (
                <Button
                  size="compact"
                  variant="ghost"
                  onClick={() => {
                    setQuery("");
                    setPage(1);
                  }}
                >
                  清除搜索
                </Button>
              )}
            </div>
          </div>
          <TabsPanel value={status} className="admin-post-panel">
            <div className="admin-post-list">
              <section className="admin-post-table-scroll" aria-label="评论列表，可横向滚动">
                <table className="admin-post-table admin-comments-table">
                  <caption className="sr-only">
                    评论列表，共 {filtered.length} 条，第 {currentPage} 页
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
                            {comment.replyTo ? (
                              <Image src="/avatar.avif" width={32} height={32} alt="" />
                            ) : (
                              <span className="admin-comments-avatar" aria-hidden="true">
                                {comment.author.slice(0, 1)}
                              </span>
                            )}
                            <div>
                              <strong>{comment.author}</strong>
                              <span title={comment.email}>{comment.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <p className="admin-comments-text">{comment.content}</p>
                          <div className="admin-comments-meta">
                            <FileText size={13} aria-hidden="true" />
                            <span>《{comment.postTitle}》</span>
                            <time dateTime={comment.timestamp}>{comment.time}</time>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`admin-post-status ${comment.status === "已通过" ? "is-published" : comment.status === "已拒绝" ? "is-rejected" : ""}`}
                          >
                            {comment.status}
                          </span>
                        </td>
                        <td>
                          <div className="admin-comments-actions">
                            {comment.status === "待审核" && (
                              <Button
                                variant="secondary"
                                size="compact"
                                title="通过审核"
                                aria-label={`通过 ${comment.author} 的评论`}
                                onClick={() => onApprove(comment.id)}
                              >
                                <Check size={16} />
                              </Button>
                            )}
                            {comment.status !== "已拒绝" && (
                              <Button
                                variant="ghost"
                                size="compact"
                                title="标记为垃圾评论"
                                aria-label={`标记 ${comment.author} 的评论为垃圾`}
                                onClick={() => onReject(comment.id)}
                              >
                                <X size={16} />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="compact"
                              title="回复评论"
                              aria-label={`回复 ${comment.author} 的评论`}
                              onClick={() => {
                                setReplyId(comment.id);
                                setReply("");
                              }}
                            >
                              <MessageCircle size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="compact"
                              title="删除评论"
                              aria-label={`删除 ${comment.author} 的评论`}
                              onClick={() => onDeleteComment(comment.id, searchRef.current)}
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
              {!filtered.length && (
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
                  显示第 {filtered.length ? start + 1 : 0}–
                  {Math.min(start + pageSize, filtered.length)} 条，共 {filtered.length} 条
                </span>
                <nav aria-label="评论分页">
                  <Button
                    size="compact"
                    variant="ghost"
                    aria-label="上一页"
                    disabled={currentPage === 1}
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
                    disabled={currentPage === pageCount}
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
        演示数据 · 审核与回复仅保留在当前会话，刷新后恢复。不会发送邮件或通知。
      </p>
      <Dialog
        open={replyId !== null}
        onOpenChange={(open) => {
          if (!open) setReplyId(null);
        }}
      >
        <DialogContent className="admin-modal admin-comments-reply">
          <div className="admin-modal-heading">
            <div>
              <DialogTitle>回复 @{targetComment?.author}</DialogTitle>
              <DialogDescription>回复仅保存为本地博主评论，刷新后恢复。</DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              aria-label="关闭回复"
              onClick={() => setReplyId(null)}
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
                maxLength={2000}
                required
                placeholder="输入你的回复内容…"
              />
            </label>
            <div className="admin-form-actions">
              <Button type="button" variant="ghost" onClick={() => setReplyId(null)}>
                取消
              </Button>
              <Button type="submit" variant="primary" disabled={!reply.trim() || !targetComment}>
                保存模拟回复
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
