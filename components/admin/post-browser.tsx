"use client";
import { useState } from "react";

import type { OperationSettings } from "@/lib/operations/schema";

import { Button } from "@/components/ui/button";
import { postTime } from "@/lib/posts/schema";

import { useAdminWorkspace } from "./admin-context";
import { operationRequest } from "./global-operations";
import { PostQueryStatus } from "./post-status";
import { usePostList, usePostClock, usePostQuery } from "./use-posts";

export function PostBrowser() {
  const now = usePostClock();
  const {
    postRevision,
    operationRevision,
    postPending,
    onEdit,
    onOpen,
    cancelPostSchedule,
    onMessage,
    runOperation,
  } = useAdminWorkspace();
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const query = usePostList({ status: "scheduled", page }, postRevision);
  const settings = usePostQuery(
    "/operations/settings",
    operationRevision,
    operationRequest<OperationSettings>,
  );
  const data = query.data;
  const publish = async () => {
    setError("");
    try {
      const result = await runOperation(
        () =>
          operationRequest<{ published: number; skipped: number }>("/operations/publish-due", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{}",
          }),
        true,
      );
      onMessage(
        `已发布 ${result.published} 篇文章${result.skipped ? `，${result.skipped} 篇需检查正文与版本` : ""}`,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "发布失败，请重新查询核对。");
      query.reload();
    }
  };
  return (
    <div className="admin-modal-section admin-post-browser">
      <p>到期后由服务器调度发布。取消排期会将文章转为草稿。</p>
      <p className="admin-muted">
        最近调度：
        {settings.error
          ? "读取失败"
          : settings.loading
            ? "正在加载…"
            : settings.data?.schedulerLastRunAt
              ? postTime(settings.data.schedulerLastRunAt)
              : "暂无执行记录，请配置服务器定时任务"}
      </p>
      {settings.error && (
        <Button size="sm" variant="ghost" onClick={settings.reload}>
          重新查询调度状态
        </Button>
      )}
      <div className="admin-operation-filters">
        <Button variant="primary" disabled={postPending} onClick={() => onOpen("compose")}>
          添加计划
        </Button>
        <Button variant="secondary" disabled={postPending || !data} onClick={() => void publish()}>
          {postPending ? "正在执行…" : "执行到期计划"}
        </Button>
        <Button variant="ghost" disabled={postPending} onClick={query.reload}>
          刷新计划
        </Button>
      </div>
      {error && <p role="alert">{error}</p>}
      <PostQueryStatus {...query} />
      <div className="admin-result-list">
        {data?.items.map((post) => (
          <div className="admin-managed-row" key={post.id}>
            <button
              className="admin-result"
              type="button"
              disabled={postPending}
              onClick={() => onEdit(post.id)}
            >
              <strong>{post.title}</strong>
              <span>
                {post.category.name} · {postTime(post.scheduledFor)}
                {post.scheduledFor && now !== null && Date.parse(post.scheduledFor) <= now
                  ? " · 等待执行"
                  : " · 已排期"}
              </span>
            </button>
            <Button
              variant="ghost"
              size="sm"
              disabled={postPending}
              onClick={async () => {
                setError("");
                try {
                  await cancelPostSchedule(post);
                } catch (cause) {
                  setError(cause instanceof Error ? cause.message : "取消排期失败。");
                  query.reload();
                }
              }}
            >
              取消排期
            </Button>
          </div>
        ))}
      </div>
      {data && !data.items.length && <p className="admin-empty">暂无排期。</p>}
      {data && (
        <nav className="admin-form-actions" aria-label="文章排期分页">
          <Button
            variant="ghost"
            size="sm"
            disabled={data.page <= 1 || postPending}
            onClick={() => setPage(data.page - 1)}
          >
            上一页
          </Button>
          <span aria-live="polite">
            {data.page} / {data.pageCount} · 共 {data.total} 篇
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={data.page >= data.pageCount || postPending}
            onClick={() => setPage(data.page + 1)}
          >
            下一页
          </Button>
        </nav>
      )}
    </div>
  );
}
