"use client";

import { ArrowUpRight, Plus, Tags, UploadCloud } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { postDisplayTitle, postTime, type PostSummary } from "@/lib/posts/schema";

import type { AdminPanel } from "./admin-shell";

import { useAdminWorkspace } from "./admin-context";
import { PostQueryStatus } from "./post-status";
import { usePostClock } from "./use-posts";

type Props = {
  postSummary: PostSummary | null;
  postSummaryLoading: boolean;
  postSummaryError: string;
  reloadPostSummary: () => void;
  onOpen: (panel: AdminPanel) => void;
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
  onOpen,
}: Props) {
  const { onEdit } = useAdminWorkspace();
  const now = usePostClock();
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
          <p>继续写作，管理文章与发布计划。</p>
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
                  <strong>{postDisplayTitle(draft.title)}</strong>
                  <span>最近编辑 {postTime(draft.updatedAt)}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="admin-workbench-empty">暂无草稿，可以开始写一篇新文章。</p>
          ))}
      </PanelCard>
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
                schedule.scheduledFor && now !== null && Date.parse(schedule.scheduledFor) <= now;
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
