"use client";
import { useEffect, useRef, useState, type SubmitEvent } from "react";

import { ConfiguredImage } from "@/components/frontend/configured-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { postTime } from "@/lib/posts/schema";
import {
  publicCommentSchema,
  type PublicComment,
  type PublicCommentList,
} from "@/lib/public/schema";

class CommentRequestError extends Error {}

export function Comments({
  postId,
  initial,
  enabled,
  adminAvatarUrl,
}: {
  postId: string;
  initial: PublicCommentList;
  enabled: boolean;
  adminAvatarUrl: string;
}) {
  const [list, setList] = useState(initial);
  const [closed, setClosed] = useState(!enabled);
  const [reply, setReply] = useState<PublicComment | null>(null);
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [retryAt, setRetryAt] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const submission = useRef<{ id: string; payload: string } | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const body = useRef<HTMLTextAreaElement>(null);
  const loadController = useRef<AbortController | null>(null);
  const sendController = useRef<AbortController | null>(null);
  const busy = useRef(false);
  useEffect(
    () => () => {
      loadController.current?.abort();
      sendController.current?.abort();
    },
    [],
  );
  useEffect(() => {
    if (!retryAt) return undefined;
    const tick = () => setSeconds(Math.max(0, Math.ceil((retryAt - Date.now()) / 1000)));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [retryAt]);
  async function load(page: number) {
    loadController.current?.abort();
    const controller = new AbortController();
    loadController.current = controller;
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch(`/api/public/posts/${postId}/comments?page=${page}`, {
        cache: "no-store",
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok) throw new CommentRequestError(result.error?.message ?? "评论加载失败。");
      if (!controller.signal.aborted) {
        setList(result.data);
        setReply(null);
      }
    } catch (failure) {
      if (!controller.signal.aborted)
        setLoadError(
          failure instanceof CommentRequestError ? failure.message : "评论加载失败，请稍后重试。",
        );
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }
  const focusError = (fields: Record<string, string[]>) => {
    const key = ["author", "email", "content"].find((field) => fields[field]);
    if (key) form.current?.querySelector<HTMLElement>(`[name="${key}"]`)?.focus();
  };
  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || closed || seconds) return;
    const parsed = publicCommentSchema.safeParse({
      author,
      email,
      content,
      parentId: reply?.id ?? null,
      submissionId: submission.current?.id ?? crypto.randomUUID(),
    });
    if (!parsed.success) {
      const fields: Record<string, string[]> = {};
      for (const issue of parsed.error.issues)
        (fields[String(issue.path[0])] ??= []).push(issue.message);
      setFieldErrors(fields);
      setMessage("");
      setError("");
      focusError(fields);
      return;
    }
    const { submissionId: _id, ...data } = parsed.data;
    const payload = JSON.stringify(data);
    if (!submission.current || submission.current.payload !== payload)
      submission.current = { id: crypto.randomUUID(), payload };
    const controller = new AbortController();
    sendController.current = controller;
    const timeout = window.setTimeout(() => controller.abort("timeout"), 15_000);
    busy.current = true;
    setSending(true);
    setError("");
    setMessage("");
    setFieldErrors({});
    try {
      const response = await fetch(`/api/public/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, submissionId: submission.current.id }),
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.error?.fieldErrors) {
          setFieldErrors(result.error.fieldErrors);
          focusError(result.error.fieldErrors);
        }
        if (result.error?.code === "COMMENTS_CLOSED") setClosed(true);
        if (result.error?.code === "SUBMISSION_CONFLICT") submission.current = null;
        if (response.status === 429) {
          const delay = Math.max(1, Number(response.headers.get("Retry-After")) || 60);
          setRetryAt(Date.now() + delay * 1000);
          setSeconds(delay);
        }
        throw new CommentRequestError(result.error?.message ?? "评论提交失败，请重试。");
      }
      setMessage(result.data.message);
      setContent("");
      setReply(null);
      submission.current = null;
    } catch (failure) {
      if (!controller.signal.aborted || controller.signal.reason === "timeout")
        setError(
          controller.signal.aborted
            ? "提交超时，草稿已保留，请重试。"
            : failure instanceof CommentRequestError
              ? failure.message
              : "提交失败，草稿已保留。请检查网络后重试。",
        );
    } finally {
      window.clearTimeout(timeout);
      busy.current = false;
      if (!controller.signal.aborted || controller.signal.reason === "timeout") setSending(false);
    }
  }
  const invalid = (field: string) => ({
    "aria-invalid": Boolean(fieldErrors[field]),
    "aria-describedby": fieldErrors[field] ? `comment-error-${field}` : undefined,
  });
  const fieldError = (field: string) =>
    fieldErrors[field] && (
      <p id={`comment-error-${field}`} className="site-field-error" role="alert">
        {fieldErrors[field][0]}
      </p>
    );
  return (
    <section className="site-comments" aria-labelledby="comments-heading">
      <div className="site-section-heading">
        <h2 id="comments-heading">
          评论 <span>{list.total}</span>
        </h2>
        <Button
          variant="ghost"
          type="button"
          disabled={loading}
          onClick={() => void load(list.page)}
        >
          {loading ? "刷新中…" : "刷新评论"}
        </Button>
      </div>
      {loadError && (
        <p role="alert" className="site-field-error">
          {loadError}
        </p>
      )}
      <div aria-busy={loading}>
        {list.items.length ? (
          <ol className="site-comment-list">
            {list.items.map((comment) => (
              <li key={comment.id} id={`comment-${comment.id}`}>
                <div className="site-comment-meta">
                  {comment.isAdmin && (
                    <span className="site-comment-avatar" aria-hidden="true">
                      <ConfiguredImage src={adminAvatarUrl} size={32} profile />
                    </span>
                  )}
                  <strong>{comment.author}</strong>
                  {comment.isAdmin && <span className="site-author-badge">博主</span>}
                  <time dateTime={comment.createdAt}>{postTime(comment.createdAt)}</time>
                </div>
                {comment.parent && <p className="site-reply-label">回复 {comment.parent.author}</p>}
                <p className="site-comment-content">{comment.content}</p>
                {!closed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    disabled={sending}
                    onClick={() => {
                      setReply(comment);
                      setMessage("");
                      body.current?.focus();
                    }}
                  >
                    回复 {comment.author}
                  </Button>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="site-empty">还没有公开评论。{!closed && "欢迎留下你的想法。"}</p>
        )}
      </div>
      {list.pageCount > 1 && (
        <nav className="site-pagination" aria-label="评论分页">
          <Button
            variant="ghost"
            disabled={loading || list.page <= 1}
            onClick={() => void load(list.page - 1)}
          >
            上一页
          </Button>
          <span>
            第 {list.page} / {list.pageCount} 页
          </span>
          <Button
            variant="ghost"
            disabled={loading || list.page >= list.pageCount}
            onClick={() => void load(list.page + 1)}
          >
            下一页
          </Button>
        </nav>
      )}
      {closed && <p className="site-notice">评论已关闭，历史评论仍可阅读。</p>}
      <form
        ref={form}
        className="site-comment-form"
        onSubmit={submit}
        noValidate
        aria-busy={sending}
      >
        <h3>{reply ? `回复 ${reply.author}` : "留下评论"}</h3>
        {reply && (
          <Button
            variant="ghost"
            type="button"
            disabled={sending}
            onClick={() => {
              setReply(null);
              body.current?.focus();
            }}
          >
            取消回复
          </Button>
        )}
        {error && (
          <p className="site-field-error" role="alert">
            {error}
          </p>
        )}
        {message && <output className="site-success">{message}</output>}
        <div className="site-comment-fields">
          <div>
            <label htmlFor="comment-author">昵称</label>
            <Input
              id="comment-author"
              name="author"
              value={author}
              maxLength={80}
              autoComplete="nickname"
              disabled={sending || closed}
              onChange={(event) => setAuthor(event.target.value)}
              {...invalid("author")}
            />
            {fieldError("author")}
          </div>
          <div>
            <label htmlFor="comment-email">邮箱（不公开）</label>
            <Input
              id="comment-email"
              name="email"
              type="email"
              value={email}
              maxLength={254}
              autoComplete="email"
              disabled={sending || closed}
              onChange={(event) => setEmail(event.target.value)}
              {...invalid("email")}
            />
            {fieldError("email")}
          </div>
        </div>
        <label htmlFor="comment-content">内容</label>
        <Textarea
          ref={body}
          id="comment-content"
          name="content"
          value={content}
          maxLength={2000}
          rows={5}
          disabled={sending || closed}
          onChange={(event) => setContent(event.target.value)}
          {...invalid("content")}
        />
        {fieldError("content")}
        <div className="site-comment-actions">
          <p>评论审核通过后公开。支持纯文本，最多 2000 个字符。</p>
          <Button type="submit" variant="primary" disabled={sending || closed || seconds > 0}>
            {sending ? "提交中…" : seconds > 0 ? `请等待 ${seconds} 秒` : "提交评论"}
          </Button>
        </div>
      </form>
    </section>
  );
}
