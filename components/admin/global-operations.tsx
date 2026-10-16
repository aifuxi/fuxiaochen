"use client";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Database,
  RefreshCw,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type {
  BackupItem,
  BackupPage,
  NotificationPage,
  OperationSettings,
} from "@/lib/operations/schema";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { postTime } from "@/lib/posts/schema";

import { useAdminWorkspace } from "./admin-context";
import { resourceRequest } from "./business-request";
import { BusinessStatus } from "./business-status";
import { RecordListMore, RecordSort } from "./record-list";
import { usePagedResource } from "./use-paged-resource";
import { usePostQuery } from "./use-posts";
import "./admin-business.css";
import "./admin-backups.css";

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
const loadBackups = (path: string, init?: RequestInit) =>
  operationRequest<BackupPage>(`/backups${path}`, init);
const backupLabels: Record<BackupItem["status"], string> = {
  running: "正在备份",
  complete: "备份完成",
  failed: "备份失败",
};

export function BackupPanel() {
  const { operationRevision, postPending, onMessage, runOperation } = useAdminWorkspace();
  const [sort, setSort] = useState("createdAt-desc");
  const [sortBy, sortDirection] = sort.split("-");
  const query = usePagedResource<BackupPage>(
    `?${new URLSearchParams({ sortBy, sortDirection, pageSize: "8" })}`,
    operationRevision,
    loadBackups,
  );
  // 最近摘要独立于列表排序，不能把最小文件误当成最近任务。
  const latestQuery = usePostQuery("?page=1&pageSize=1", operationRevision, loadBackups);
  const settings = usePostQuery(
    "/operations/settings",
    operationRevision,
    operationRequest<OperationSettings>,
  );
  const [detail, setDetail] = useState<BackupItem | null>(null);
  const detailTrigger = useRef<HTMLElement | null>(null);
  const latest = latestQuery.data?.items[0];
  const listBusy = postPending || query.loading || query.loadingMore;
  const [error, setError] = useState("");
  const requestId = useRef<string | null>(null);
  const [uncertain, setUncertain] = useState(false);
  const makeBackup = async () => {
    if (listBusy) return;
    setSort("createdAt-desc");
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
  function openDetails(item: BackupItem, trigger: HTMLElement) {
    detailTrigger.current = trigger;
    setDetail(item);
  }
  function refresh() {
    query.reload();
    latestQuery.reload();
    settings.reload();
  }
  return (
    <div className="admin-backups admin-data-page">
      <div className="admin-page-heading">
        <div>
          <h1>备份管理</h1>
          <p>查看数据库备份记录、执行备份与配置自动备份。</p>
        </div>
        <Button
          size="compact"
          variant="primary"
          disabled={listBusy}
          onClick={() => void makeBackup()}
        >
          <Database size={16} aria-hidden="true" />
          {postPending ? "正在执行…" : uncertain ? "核对本次备份" : "立即备份数据库"}
        </Button>
      </div>
      {error && (
        <p role="alert" className="admin-business-error">
          {error}
        </p>
      )}
      <div className="admin-backup-layout">
        <Card className="admin-backup-latest">
          <div className="admin-backup-card-heading">
            <h2>最近一次备份</h2>
            {latest && (
              <span className={`admin-backup-state is-${latest.status}`}>
                {latest.status === "complete" ? (
                  <CheckCircle2 size={15} aria-hidden="true" />
                ) : latest.status === "failed" ? (
                  <CircleAlert size={15} aria-hidden="true" />
                ) : (
                  <Clock3 size={15} aria-hidden="true" />
                )}
                {backupLabels[latest.status]}
              </span>
            )}
          </div>
          <BusinessStatus {...latestQuery} />
          {latest ? (
            <>
              <div className="admin-backup-facts">
                <div>
                  <span>执行时间（北京时间）</span>
                  <strong>{postTime(latest.createdAt)}</strong>
                </div>
                <div>
                  <span>文件大小</span>
                  <strong>
                    {latest.bytes === null ? "待生成" : (latest.bytes / 1024 / 1024).toFixed(2)}{" "}
                    {latest.bytes !== null && <small>MiB</small>}
                  </strong>
                </div>
              </div>
              <div className="admin-backup-reference">
                <div>
                  <span>备份编号</span>
                  <code>{latest.id}</code>
                </div>
                <Button
                  variant="ghost"
                  size="compact"
                  disabled={postPending}
                  onClick={(event) => openDetails(latest, event.currentTarget)}
                >
                  校验详情 <ArrowRight size={15} aria-hidden="true" />
                </Button>
              </div>
            </>
          ) : (
            !latestQuery.loading &&
            !latestQuery.error && <p className="admin-muted">暂无数据库备份。</p>
          )}
        </Card>
        <Card className="admin-backup-automation">
          <div className="admin-backup-card-heading">
            <h2>自动备份</h2>
            <span className="admin-muted">
              {settings.data ? (settings.data.autoBackup ? "已开启" : "已关闭") : ""}
            </span>
          </div>
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
          <p className="admin-muted">自动备份由服务器定时任务执行。</p>
          <div className="admin-backup-schedule">
            <span>最近调度</span>
            <time>
              {settings.loading
                ? "正在加载…"
                : settings.error
                  ? "无法读取调度状态"
                  : settings.data?.schedulerLastRunAt
                    ? postTime(settings.data.schedulerLastRunAt)
                    : "暂无执行记录"}
            </time>
          </div>
        </Card>
        <section className="admin-data-workspace admin-backup-history" aria-label="数据库备份记录">
          <div className="admin-backup-history-heading">
            <h2>
              执行记录 <span>{query.data?.total ?? "…"}</span>
            </h2>
            <div className="admin-backup-history-actions">
              <RecordSort
                label="备份记录排序"
                value={sort}
                onChange={setSort}
                disabled={listBusy}
                options={[
                  ["createdAt-desc", "最新优先"],
                  ["createdAt-asc", "最早优先"],
                  ["status-asc", "执行中优先"],
                  ["status-desc", "失败优先"],
                  ["bytes-desc", "文件从大到小"],
                  ["bytes-asc", "文件从小到大"],
                ]}
              />
              <Button size="compact" variant="ghost" disabled={listBusy} onClick={refresh}>
                <RefreshCw size={15} aria-hidden="true" />
                刷新备份记录
              </Button>
            </div>
          </div>
          <BusinessStatus {...query} />
          <ul
            className="admin-record-list"
            aria-label="备份执行记录"
            aria-busy={query.loading || query.loadingMore}
          >
            {query.data?.items.map((item) => (
              <li
                className="admin-record-item admin-backup-entry"
                key={item.id}
                data-record-id={item.id}
                tabIndex={-1}
              >
                <div className="admin-record-copy">
                  <div className="admin-entry-heading">
                    <h3>
                      <time dateTime={item.createdAt}>{postTime(item.createdAt)}</time>
                    </h3>
                    <span className={`admin-backup-state is-${item.status}`}>
                      {item.status === "complete" ? (
                        <CheckCircle2 size={15} aria-hidden="true" />
                      ) : item.status === "failed" ? (
                        <CircleAlert size={15} aria-hidden="true" />
                      ) : (
                        <Clock3 size={15} aria-hidden="true" />
                      )}
                      {backupLabels[item.status]}
                    </span>
                  </div>
                  <div className="admin-entry-meta">
                    <span>
                      {item.bytes === null
                        ? "文件大小待生成"
                        : `${(item.bytes / 1024 / 1024).toFixed(2)} MiB`}
                    </span>
                    <span>
                      编号 <code>{item.id}</code>
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="compact"
                  disabled={listBusy}
                  aria-label={`查看 ${postTime(item.createdAt)} 的备份详情`}
                  onClick={(event) => openDetails(item, event.currentTarget)}
                >
                  查看详情 <ArrowRight size={15} aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
          {query.data && !query.data.items.length && (
            <p className="admin-empty">暂无数据库备份。</p>
          )}
          <RecordListMore resource={query} disabled={postPending} label="显示更多记录" />
        </section>
        <Card className="admin-backup-scope">
          <h2>备份与恢复</h2>
          <div>
            <h3>数据库内容</h3>
            <p>包含文章、设置、会话及媒体元数据。</p>
          </div>
          <div>
            <h3>OSS 文件</h3>
            <p>文件本体不在数据库备份中。</p>
          </div>
          <div>
            <h3>恢复影响</h3>
            <p>备份保存在服务器。恢复时会撤销全部登录会话。</p>
          </div>
        </Card>
      </div>
      <Dialog open={Boolean(detail)} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="admin-backup-detail-dialog" finalFocus={detailTrigger}>
          <div className="admin-backup-dialog-heading">
            <div>
              <DialogTitle>备份校验详情</DialogTitle>
              <DialogDescription>完整备份标识、文件大小与校验摘要。</DialogDescription>
            </div>
            <DialogClose
              render={
                <Button variant="ghost" size="compact" aria-label="关闭详情">
                  <X size={18} aria-hidden="true" />
                </Button>
              }
            />
          </div>
          {detail && (
            <dl className="admin-backup-detail">
              <div>
                <dt>执行时间</dt>
                <dd>{postTime(detail.createdAt)}</dd>
              </div>
              <div>
                <dt>状态</dt>
                <dd>{backupLabels[detail.status]}</dd>
              </div>
              <div>
                <dt>文件大小</dt>
                <dd>
                  {detail.bytes === null
                    ? "待生成"
                    : `${detail.bytes.toLocaleString("zh-CN")} 字节`}
                </dd>
              </div>
              <div>
                <dt>备份编号</dt>
                <dd>{detail.id}</dd>
              </div>
              <div>
                <dt>SHA-256</dt>
                <dd>
                  {detail.sha256 || (detail.status === "failed" ? "未生成" : "执行完成后生成")}
                </dd>
              </div>
              {detail.finishedAt && (
                <div>
                  <dt>结束时间</dt>
                  <dd>{postTime(detail.finishedAt)}</dd>
                </div>
              )}
            </dl>
          )}
          <DialogClose render={<Button className="admin-backup-detail-close">关闭</Button>} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
