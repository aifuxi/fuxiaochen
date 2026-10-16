"use client";
import { useEffect, useRef, useState } from "react";

import type {
  BackupItem,
  BackupPage,
  NotificationPage,
  OperationSettings,
} from "@/lib/operations/schema";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { postTime } from "@/lib/posts/schema";

import { useAdminWorkspace } from "./admin-context";
import { resourceRequest } from "./business-request";
import { BusinessStatus } from "./business-status";
import { usePostQuery } from "./use-posts";
import "./admin-business.css";

export const operationRequest = resourceRequest("/api/admin");
export function useNotificationSummary(revision: number) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const refresh = () => {
      if (!document.hidden) setTick((value) => value + 1);
    };
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  return usePostQuery(
    "/notifications/summary",
    revision + tick,
    operationRequest<{ unreadCount: number }>,
  );
}
function Pagination({
  data,
  disabled,
  onPage,
}: {
  data: { page: number; pageCount: number; total: number } | null;
  disabled: boolean;
  onPage: (page: number) => void;
}) {
  return (
    data && (
      <nav className="admin-operation-pagination" aria-label="分页">
        <Button
          variant="ghost"
          size="compact"
          disabled={disabled || data.page <= 1}
          onClick={() => onPage(data.page - 1)}
        >
          上一页
        </Button>
        <span className="admin-operation-page-status" aria-live="polite">
          {data.page} / {data.pageCount} · 共 {data.total} 条
        </span>
        <Button
          variant="ghost"
          size="compact"
          disabled={disabled || data.page >= data.pageCount}
          onClick={() => onPage(data.page + 1)}
        >
          下一页
        </Button>
      </nav>
    )
  );
}
export function NotificationCenter() {
  const { operationRevision, postPending, onNavigate, onOpen, onMessage, runOperation } =
    useAdminWorkspace();
  const [page, setPage] = useState(1);
  const [unread, setUnread] = useState(false);
  const query = usePostQuery(
    `/notifications?page=${page}&unread=${unread}&pageSize=20`,
    operationRevision,
    operationRequest<NotificationPage>,
  );
  const [error, setError] = useState("");
  const data = query.data;
  const markRead = async (ids: string[], href?: string) => {
    setError("");
    try {
      await runOperation(() =>
        operationRequest("/notifications/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        }),
      );
      if (href) {
        if (ids[0].startsWith("backup:")) onOpen("backup");
        else onNavigate(href);
      } else onMessage("本页通知已标为已读");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "标记失败，请重试。");
    }
  };
  return (
    <div className="admin-modal-section">
      <div className="admin-operation-filters">
        <Button
          size="compact"
          variant="ghost"
          aria-pressed={!unread}
          disabled={postPending}
          onClick={() => {
            setUnread(false);
            setPage(1);
          }}
        >
          全部
        </Button>
        <Button
          size="compact"
          variant="ghost"
          aria-pressed={unread}
          disabled={postPending}
          onClick={() => {
            setUnread(true);
            setPage(1);
          }}
        >
          未读 {data?.unreadCount ?? "—"}
        </Button>
        <Button
          size="compact"
          variant="secondary"
          disabled={postPending || !data?.items.some((item) => !item.read)}
          onClick={() =>
            void markRead(data!.items.filter((item) => !item.read).map((item) => item.id))
          }
        >
          本页全部已读
        </Button>
      </div>
      <BusinessStatus {...query} />
      {error && <p role="alert">{error}</p>}
      <div className="admin-result-list">
        {data?.items.map((item) => (
          <button
            className="admin-result"
            type="button"
            disabled={postPending}
            key={item.id}
            onClick={() => {
              if (item.read) {
                if (item.id.startsWith("backup:")) onOpen("backup");
                else onNavigate(item.href);
              } else void markRead([item.id], item.href);
            }}
          >
            <strong>{item.title}</strong>
            <span>
              {postTime(item.createdAt)} · {item.resolved ? "已处理" : item.read ? "已读" : "未读"}
            </span>
          </button>
        ))}
      </div>
      {data && !data.items.length && (
        <p className="admin-empty">{unread ? "暂无未读通知。" : "暂无通知。"}</p>
      )}
      <Pagination data={data} disabled={postPending} onPage={setPage} />
    </div>
  );
}
export function BackupPanel() {
  const { operationRevision, postPending, onMessage, runOperation } = useAdminWorkspace();
  const [page, setPage] = useState(1);
  const query = usePostQuery(
    `/backups?page=${page}`,
    operationRevision,
    operationRequest<BackupPage>,
  );
  const settings = usePostQuery(
    "/operations/settings",
    operationRevision,
    operationRequest<OperationSettings>,
  );
  const [error, setError] = useState("");
  const requestId = useRef<string | null>(null);
  const [uncertain, setUncertain] = useState(false);
  const makeBackup = async () => {
    setError("");
    requestId.current ??= crypto.randomUUID();
    try {
      const row = await runOperation(() =>
        operationRequest<BackupItem>("/backups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: requestId.current }),
        }),
      );
      if (row.status !== "running") requestId.current = null;
      setUncertain(row.status === "running");
      if (row.status === "failed") setError("备份失败，请检查服务器存储后重试。");
      onMessage(
        row.status === "complete"
          ? "数据库备份已完成"
          : row.status === "running"
            ? "备份仍在执行，请查询记录"
            : "数据库备份失败",
      );
    } catch (cause) {
      setUncertain(true);
      setError(cause instanceof Error ? cause.message : "备份响应不确定，请核对记录。");
      query.reload();
    }
  };
  const toggleBackup = async (checked: boolean) => {
    if (!settings.data) return;
    setError("");
    try {
      await runOperation(() =>
        operationRequest("/operations/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ autoBackup: checked, version: settings.data!.version }),
        }),
      );
      onMessage(checked ? "已启用每日数据库备份" : "已关闭每日数据库备份");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "设置保存失败。");
      settings.reload();
    }
  };
  return (
    <div className="admin-modal-section">
      <p>保存文章、设置、会话及媒体元数据。OSS 文件不在数据库备份中。</p>
      <Button variant="primary" disabled={postPending} onClick={() => void makeBackup()}>
        {postPending ? "正在执行…" : uncertain ? "核对本次备份" : "立即备份数据库"}
      </Button>
      {error && <p role="alert">{error}</p>}
      <BusinessStatus {...settings} />
      <div className="admin-operation-toggle">
        <label htmlFor="admin-auto-backup">每日自动备份数据库</label>
        <Switch
          id="admin-auto-backup"
          touchTarget
          checked={settings.data?.autoBackup ?? false}
          disabled={postPending || !settings.data}
          onCheckedChange={(checked) => void toggleBackup(checked)}
        />
      </div>
      <p className="admin-muted">
        最近调度：
        {settings.loading
          ? "正在加载…"
          : settings.error
            ? "无法读取调度状态"
            : settings.data?.schedulerLastRunAt
              ? postTime(settings.data.schedulerLastRunAt)
              : "暂无执行记录"}
      </p>
      <p className="admin-muted">
        自动备份由服务器定时任务执行。备份保存在服务器，恢复时会撤销全部登录会话。
      </p>
      <BusinessStatus {...query} />
      <div className="admin-result-list">
        {query.data?.items.map((item) => (
          <div className="admin-backup-row" key={item.id}>
            <strong>
              {item.status === "complete"
                ? "备份完成"
                : item.status === "running"
                  ? "正在备份"
                  : "备份失败"}{" "}
              · {postTime(item.createdAt)}
            </strong>
            <span>{item.id}</span>
            {item.bytes !== null && <span>{item.bytes.toLocaleString("zh-CN")} 字节</span>}
            {item.sha256 && <small>SHA-256：{item.sha256}</small>}
          </div>
        ))}
      </div>
      {query.data && !query.data.items.length && <p className="admin-empty">暂无数据库备份。</p>}
      <Button size="sm" variant="ghost" disabled={postPending} onClick={() => query.reload()}>
        刷新备份记录
      </Button>
      <Pagination data={query.data} disabled={postPending} onPage={setPage} />
    </div>
  );
}
