"use client";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type {
  BackupItem,
  BackupPage,
  NotificationPage,
  OperationSettings,
  SearchPage,
} from "@/lib/operations/schema";

import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Switch } from "@/components/ui/switch";
import { searchKinds, searchLabels } from "@/lib/operations/schema";
import { postTime } from "@/lib/posts/schema";

import { useAdminWorkspace } from "./admin-context";
import { resourceRequest } from "./business-request";
import { BusinessStatus } from "./business-status";
import { useDebouncedPostQuery, usePostQuery } from "./use-posts";
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
      <nav className="admin-form-actions" aria-label="分页">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled || data.page <= 1}
          onClick={() => onPage(data.page - 1)}
        >
          上一页
        </Button>
        <span aria-live="polite">
          {data.page} / {data.pageCount} · 共 {data.total} 条
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled || data.page >= data.pageCount}
          onClick={() => onPage(data.page + 1)}
        >
          下一页
        </Button>
      </nav>
    )
  );
}
export function GlobalSearch() {
  const { postRevision, operationRevision, postPending, onNavigate } = useAdminWorkspace();
  const [input, setInput] = useState("");
  const [kind, setKind] = useState("");
  const [page, setPage] = useState(1);
  const q = useDebouncedPostQuery(input);
  const query = usePostQuery(
    q
      ? `/search?${new URLSearchParams({ q, ...(kind ? { kind } : {}), page: String(page) })}`
      : null,
    postRevision + operationRevision,
    operationRequest<SearchPage>,
  );
  const data = input.trim() === q ? query.data : null;
  return (
    <div className="admin-modal-section">
      <label htmlFor="admin-global-search">搜索后台内容</label>
      <InputGroup>
        <InputGroupInput
          id="admin-global-search"
          value={input}
          maxLength={200}
          placeholder="输入关键词…"
          onChange={(event) => {
            setInput(event.target.value);
            setPage(1);
          }}
        />
        <InputGroupAddon>
          <Search size={16} aria-hidden="true" />
        </InputGroupAddon>
      </InputGroup>
      <fieldset className="admin-operation-filters" aria-label="内容范围">
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={!kind}
          onClick={() => {
            setKind("");
            setPage(1);
          }}
        >
          全部
        </Button>
        {searchKinds.map((value) => (
          <Button
            key={value}
            size="sm"
            variant="ghost"
            aria-pressed={kind === value}
            onClick={() => {
              setKind(value);
              setPage(1);
            }}
          >
            {searchLabels[value]}
          </Button>
        ))}
      </fieldset>
      {!input.trim() ? (
        <p className="admin-empty">输入关键词开始搜索。</p>
      ) : (
        <BusinessStatus {...query} loading={query.loading || input.trim() !== q} />
      )}
      <div className="admin-result-list">
        {data?.items.map((item) => (
          <button
            className="admin-result"
            type="button"
            disabled={postPending}
            key={`${item.kind}:${item.id}`}
            onClick={() => onNavigate(item.href)}
          >
            <strong>{item.title}</strong>
            <span>
              {searchLabels[item.kind]} · {item.description}
            </span>
          </button>
        ))}
      </div>
      {data && !data.items.length && <p className="admin-empty">没有找到匹配内容。</p>}
      <Pagination data={data} disabled={postPending} onPage={setPage} />
    </div>
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
          size="sm"
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
          size="sm"
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
          size="sm"
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
      <p>保存文章、评论、设置、会话及媒体元数据。OSS 文件不在数据库备份中。</p>
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
