"use client";

import { ArrowRight, ArrowUpRight, Check, Plus, Tags, Trash2, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import type { CommentItem, CommentSummary } from "@/lib/comments/schema";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { durationLabel } from "@/lib/analytics/schema";
import { postTime, type PostSummary } from "@/lib/posts/schema";

import type { AdminPanel } from "./admin-shell";

import { useAdminWorkspace } from "./admin-context";
import { AnalyticsQueryStatus, useAnalytics } from "./analytics-query";
import { CollectionStatus } from "./collection-status";
import { CommentQueryStatus } from "./comment-status";
import { PostQueryStatus } from "./post-status";
import { usePostClock } from "./use-posts";

type Props = {
  postSummary: PostSummary | null;
  postSummaryLoading: boolean;
  postSummaryError: string;
  reloadPostSummary: () => void;
  commentSummary: CommentSummary | null;
  commentSummaryLoading: boolean;
  commentSummaryError: string;
  reloadCommentSummary: () => void;
  commentPending: boolean;
  onOpen: (panel: AdminPanel) => void;
  onApprove: (comment: CommentItem) => Promise<void>;
  onDelete: (comment: CommentItem, fallbackFocus?: HTMLElement | null) => void;
};

function PanelCard({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`admin-panel ${className}`}>
      <div className="admin-panel-heading">
        <h2>{title}</h2>
        {action}
      </div>
      <div className="admin-panel-body">{children}</div>
    </Card>
  );
}

export function AdminDashboard({
  postSummary,
  postSummaryLoading,
  postSummaryError,
  reloadPostSummary,
  commentSummary,
  commentSummaryLoading,
  commentSummaryError,
  reloadCommentSummary,
  commentPending,
  onOpen,
  onApprove,
  onDelete,
}: Props) {
  const { onEdit } = useAdminWorkspace();
  const now = usePostClock();
  const analytics = useAnalytics("30d");
  const snapshot = analytics.data;
  const pending = commentSummary?.pending ?? [];
  const pendingCount = commentSummary?.statusCounts.pending;
  const commentsLink = useRef<HTMLButtonElement>(null);
  const stats = [
    {
      href: "/admin/posts?status=published",
      label: "已发布文章",
      value: postSummary ? String(postSummary.statusCounts.published) : "—",
      note: "篇文章",
    },
    {
      href: "/admin/posts?status=draft",
      label: "草稿箱",
      value: postSummary ? String(postSummary.statusCounts.draft) : "—",
      note: "篇草稿 · 待编辑",
    },
    {
      href: "/admin/comments",
      label: "待审核评论",
      value: pendingCount === undefined ? "—" : String(pendingCount),
      note: "条评论 · 待处理",
    },
    {
      href: "/admin/posts?status=scheduled",
      label: "定时发布",
      value: postSummary ? String(postSummary.statusCounts.scheduled) : "—",
      note: "篇文章 · 已排期",
    },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-page-heading">
        <div>
          <h1>工作台</h1>
          <p>继续写作，处理评论与发布计划。</p>
        </div>
        <Button size="compact" variant="primary" onClick={() => onOpen("compose")}>
          <Plus size={16} aria-hidden="true" />
          新建文章
        </Button>
      </div>
      <div className="admin-stats">
        {stats.map((stat) => (
          <Link href={stat.href} className="ds-card ds-card-link admin-stat" key={stat.label}>
            <div className="admin-stat-top">
              <span>{stat.label}</span>
            </div>
            <strong>{stat.value}</strong>
            <div className="admin-stat-bottom">
              <small>{stat.note}</small>
            </div>
          </Link>
        ))}
      </div>
      <PanelCard
        title="继续编辑"
        action={
          <Link href="/admin/posts?status=draft" className="admin-inline-link">
            全部草稿 <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        }
      >
        <PostQueryStatus
          loading={postSummaryLoading}
          error={postSummaryError}
          reload={reloadPostSummary}
        />
        {!postSummaryLoading &&
          !postSummaryError &&
          (postSummary?.recentDrafts.length ? (
            <div className="admin-draft-list">
              {postSummary.recentDrafts.map((draft) => (
                <button
                  type="button"
                  key={draft.id}
                  className="admin-result"
                  onClick={() => onEdit(draft.id)}
                >
                  <strong>{draft.title}</strong>
                  <span>最近编辑 {postTime(draft.updatedAt)}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="admin-workbench-empty">暂无草稿，可以开始写一篇新文章。</p>
          ))}
      </PanelCard>
      <div className="admin-lower-grid">
        <PanelCard
          title={`待审核评论 · ${pendingCount ?? "—"}`}
          action={
            <Button
              ref={commentsLink}
              variant="ghost"
              size="compact"
              onClick={() => onOpen("comments")}
            >
              查看全部 <ArrowUpRight size={14} />
            </Button>
          }
        >
          <CommentQueryStatus
            loading={commentSummaryLoading}
            error={commentSummaryError}
            reload={reloadCommentSummary}
          />
          {!commentSummaryLoading && !commentSummaryError && (
            <div className="admin-comment-list">
              {pending.length ? (
                pending.slice(0, 5).map((comment) => (
                  <div className="admin-comment" key={comment.id}>
                    <div className="admin-comment-content">
                      <div className="admin-comment-meta">
                        <strong>{comment.author}</strong>
                        <span>{postTime(comment.createdAt)}</span>
                      </div>
                      <p>{comment.content}</p>
                      <small>在文章《{comment.postTitle}》</small>
                    </div>
                    <div className="admin-comment-actions">
                      <Button
                        variant="secondary"
                        size="compact"
                        disabled={commentPending}
                        onClick={() => void onApprove(comment)}
                        aria-label={`通过 ${comment.author} 的评论`}
                      >
                        <Check size={14} />
                        通过
                      </Button>
                      <Button
                        variant="ghost"
                        size="compact"
                        aria-label={`删除 ${comment.author} 的评论`}
                        disabled={commentPending}
                        onClick={() => onDelete(comment, commentsLink.current)}
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="admin-workbench-empty">暂无待审核评论，所有留言均已处理。</p>
              )}
            </div>
          )}
        </PanelCard>
        <div className="admin-side-stack">
          <PanelCard
            title="定时发布计划"
            action={
              <Button variant="ghost" size="compact" onClick={() => onOpen("schedule")}>
                管理 <ArrowUpRight size={14} />
              </Button>
            }
          >
            <div className="admin-schedule-list">
              <PostQueryStatus
                loading={postSummaryLoading}
                error={postSummaryError}
                reload={reloadPostSummary}
              />
              {Boolean(postSummary?.schedules.length) && (
                <p className="admin-muted">最近 5 条排期 · 到期后由调度任务发布</p>
              )}
              {postSummary?.schedules.length ? (
                postSummary.schedules.map((schedule) => {
                  const waiting =
                    schedule.scheduledFor &&
                    now !== null &&
                    Date.parse(schedule.scheduledFor) <= now;
                  return (
                    <div className="admin-schedule" key={schedule.id}>
                      <div>
                        <button
                          type="button"
                          className="admin-post-title"
                          onClick={() => onEdit(schedule.id)}
                        >
                          {schedule.title}
                        </button>
                        <small>{postTime(schedule.scheduledFor)}</small>
                      </div>
                      <span className={waiting ? "is-waiting" : "is-scheduled"}>
                        {waiting ? "等待执行" : "已排期"}
                      </span>
                    </div>
                  );
                })
              ) : postSummary ? (
                <p className="admin-workbench-empty">暂无排期。</p>
              ) : null}
            </div>
          </PanelCard>
        </div>
      </div>
      <PanelCard
        title="访问摘要 · 近 30 天"
        action={
          <Button variant="ghost" size="compact" onClick={() => onOpen("analytics")}>
            详细分析 <ArrowRight size={14} aria-hidden="true" />
          </Button>
        }
      >
        <AnalyticsQueryStatus
          loading={analytics.isPending}
          error={analytics.error}
          hasData={!!snapshot}
          reload={() => void analytics.refetch()}
        />
        {snapshot && (
          <>
            <CollectionStatus collection={snapshot.collection} incomplete={snapshot.incomplete} />
            {snapshot.metrics.pv ? (
              <dl className="admin-traffic-summary">
                <div>
                  <dt>浏览量 (PV)</dt>
                  <dd>{snapshot.metrics.pv.toLocaleString("zh-CN")}</dd>
                </div>
                <div>
                  <dt>独立访客 (UV)</dt>
                  <dd>{snapshot.metrics.uv.toLocaleString("zh-CN")}</dd>
                </div>
                <div>
                  <dt>平均阅读时长</dt>
                  <dd>{durationLabel(snapshot.metrics.durationMs)}</dd>
                </div>
              </dl>
            ) : (
              <p className="admin-workbench-empty">当前区间暂无访问数据。</p>
            )}
          </>
        )}
      </PanelCard>
      <section className="admin-quick" aria-label="常用操作">
        <h2>常用操作</h2>
        <div className="admin-quick-buttons">
          <Button size="compact" variant="secondary" onClick={() => onOpen("upload")}>
            <UploadCloud size={15} />
            上传媒体
          </Button>
          <Button size="compact" variant="secondary" onClick={() => onOpen("categories")}>
            <Tags size={15} />
            分类标签
          </Button>
          <Button size="compact" variant="secondary" onClick={() => onOpen("backup")}>
            数据库备份
          </Button>
        </div>
      </section>
    </div>
  );
}
