"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Plus,
  ShieldCheck,
  Tags,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useRef, useState } from "react";

import type { CommentItem, CommentSummary } from "@/lib/comments/schema";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@/components/ui/tabs";
import { postTime, type PostSummary } from "@/lib/posts/schema";

import type { AdminPanel } from "./admin-shell";

import { CommentQueryStatus } from "./comment-status";
import { initialSources, traffic30Days } from "./mock-data";
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
  onBackup: () => void;
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

function TrafficChart() {
  const [range, setRange] = useState<"7d" | "30d">("7d");
  const [active, setActive] = useState<number | null>(null);
  const data = range === "7d" ? traffic30Days.slice(-7) : traffic30Days;
  const width = 640;
  const height = 250;
  const left = 42;
  const right = 18;
  const top = 18;
  const bottom = 38;
  const plotHeight = height - top - bottom;
  const points = data.map((point, index) => ({
    ...point,
    x: left + (index * (width - left - right)) / (data.length - 1),
    y: top + plotHeight * (1 - point.visits / 10000),
  }));
  const path = points
    .map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(" ");
  const area = `${path} L${points.at(-1)?.x},${height - bottom} L${points[0].x},${height - bottom} Z`;

  return (
    <Tabs
      className="admin-chart-tabs"
      value={range}
      onValueChange={(value) => {
        if (value !== "7d" && value !== "30d") return;
        setRange(value);
        setActive(null);
      }}
    >
      <PanelCard
        title="访问量趋势 · 演示"
        className="admin-chart-panel"
        action={
          <TabsList size="compact" aria-label="图表时间范围">
            <TabsTrigger value="7d">近 7 天</TabsTrigger>
            <TabsTrigger value="30d">近 30 天</TabsTrigger>
          </TabsList>
        }
      >
        <TabsPanel value={range} className="admin-chart-content">
          <p className="admin-module-note">
            演示快照 · 2025-{data[0].date} 至 2025-{data.at(-1)?.date}
          </p>
          <output className="admin-chart-detail" aria-live="polite">
            {active === null
              ? "悬停、点击或聚焦数据点查看访问量"
              : `${points[active].date} · ${points[active].visits.toLocaleString()} 次访问`}
          </output>
          <section className="admin-chart-scroll" aria-label="访问量趋势，可横向滚动">
            <div
              className="admin-chart-wrap"
              style={{
                minWidth: `max(540px, ${points.length * 51}px * var(--admin-chart-touch, 0))`,
              }}
            >
              <svg
                viewBox={`0 0 ${width} ${height}`}
                aria-label={`${range === "7d" ? "近 7 天" : "近 30 天"}访问量趋势图`}
              >
                <defs>
                  <linearGradient id="admin-chart-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity=".35" />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[2500, 5000, 7500, 10000].map((value) => {
                  const y = top + plotHeight * (1 - value / 10000);
                  return (
                    <g key={value}>
                      <line
                        x1={left}
                        x2={width - right}
                        y1={y}
                        y2={y}
                        stroke="var(--color-outline)"
                        strokeDasharray="4 5"
                      />
                      <text x={left - 8} y={y + 4} textAnchor="end">
                        {value.toLocaleString()}
                      </text>
                    </g>
                  );
                })}
                <path d={area} fill="url(#admin-chart-fill)" />
                <path
                  d={path}
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2.6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {points.map((point, index) => (
                  <g key={point.date}>
                    {(range === "7d" || index % 5 === 0 || index === points.length - 1) && (
                      <text x={point.x} y={height - 12} textAnchor="middle">
                        {point.date}
                      </text>
                    )}
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={active === index ? 7 : range === "7d" ? 4.5 : 3}
                      fill="var(--color-stage)"
                      stroke="var(--color-primary)"
                      strokeWidth="2.4"
                    />
                  </g>
                ))}
              </svg>
              {points.map((point, index) => (
                <Button
                  key={point.date}
                  variant="ghost"
                  className="admin-chart-point"
                  style={{
                    left: `${(point.x / width) * 100}%`,
                    width: `${((width - left - right) / (points.length - 1) / width) * 100}%`,
                  }}
                  aria-label={`${point.date}，${point.visits.toLocaleString()} 次访问`}
                  onMouseEnter={() => setActive(index)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(index)}
                  onBlur={() => setActive(null)}
                  onClick={() => setActive(index)}
                />
              ))}
            </div>
          </section>
        </TabsPanel>
      </PanelCard>
    </Tabs>
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
  onBackup,
}: Props) {
  const now = usePostClock();
  const pending = commentSummary?.pending ?? [];
  const pendingCount = commentSummary?.statusCounts.pending;
  const commentsLink = useRef<HTMLButtonElement>(null);
  const stats = [
    {
      label: "已发布文章",
      value: postSummary ? String(postSummary.statusCounts.published) : "—",
      source: "数据库",
      note: "篇文章",
    },
    {
      label: "草稿箱",
      value: postSummary ? String(postSummary.statusCounts.draft) : "—",
      source: "数据库",
      note: "篇草稿 · 待编辑",
    },
    {
      label: "待审核评论",
      value: pendingCount === undefined ? "—" : String(pendingCount),
      source: "数据库",
      note: "条评论 · 待处理",
    },
    { label: "总访问量", value: "128,942", source: "演示", note: "+18.6% · 较上周" },
    { label: "本周访客", value: "8,432", source: "演示", note: "+12.3% · 较上周" },
    { label: "邮件订阅", value: "2,156", source: "演示", note: "+8.7% · 较上周" },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-page-heading">
        <div>
          <h1>仪表盘</h1>
          <p>查看文章、评论与发布计划；运营指标为演示数据。</p>
        </div>
        <Button size="compact" variant="primary" onClick={() => onOpen("compose")}>
          <Plus size={16} aria-hidden="true" />
          新建文章
        </Button>
      </div>
      <div className="admin-stats">
        {stats.map((stat) => (
          <Card className="admin-stat" key={stat.label}>
            <div className="admin-stat-top">
              <span>{stat.label}</span>
              <small>{stat.source}</small>
            </div>
            <strong>{stat.value}</strong>
            <div className="admin-stat-bottom">
              <small>{stat.note}</small>
            </div>
          </Card>
        ))}
      </div>
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
                <p className="admin-empty">暂无待审核评论，所有留言均已处理。</p>
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
              <p className="admin-muted">暂未启用自动发布 · 显示最近 5 条排期</p>
              {postSummary?.schedules.length ? (
                postSummary.schedules.map((schedule) => (
                  <div className="admin-schedule" key={schedule.id}>
                    <div>
                      <strong>{schedule.title}</strong>
                      <small>{postTime(schedule.scheduledFor)}</small>
                    </div>
                    <span>
                      {schedule.scheduledFor &&
                      now !== null &&
                      Date.parse(schedule.scheduledFor) <= now
                        ? "已过期"
                        : "已排期"}
                    </span>
                  </div>
                ))
              ) : postSummary ? (
                <p className="admin-empty">暂无排期。</p>
              ) : null}
            </div>
          </PanelCard>
          <PanelCard title="运行健康度 · 演示">
            <p className="admin-module-note">监控与自动备份尚未接入，以下为演示指标。</p>
            <div className="admin-health">
              <div>
                <span>磁盘使用</span>
                <strong>3.2 / 10 GB</strong>
              </div>
              <div>
                <span>备份健康度</span>
                <strong>96 分</strong>
              </div>
              <div>
                <span>备份状态</span>
                <strong>正常</strong>
              </div>
              <div>
                <span>安全防御</span>
                <strong>未发现风险</strong>
              </div>
            </div>
          </PanelCard>
        </div>
      </div>
      <div className="admin-analysis-grid">
        <TrafficChart />
        <PanelCard title="访客来源 · 演示" className="admin-source-panel">
          <div className="admin-sources">
            {initialSources.map((source) => (
              <div className="admin-source" key={source.name}>
                <div>
                  <span>{source.name}</span>
                  <span>{source.percentage}%</span>
                </div>
                <progress
                  className="admin-progress"
                  value={source.percentage}
                  max={100}
                  aria-label={source.name}
                />
              </div>
            ))}
          </div>
          <div className="admin-sources-footer">
            <span>主要来源：直接访问</span>
            <Button variant="ghost" size="compact" onClick={() => onOpen("analytics")}>
              详细分析 <ArrowRight size={14} />
            </Button>
          </div>
        </PanelCard>
      </div>
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
          <Button size="compact" variant="secondary" onClick={onBackup}>
            <ShieldCheck size={15} />
            模拟备份
          </Button>
        </div>
      </section>
    </div>
  );
}
