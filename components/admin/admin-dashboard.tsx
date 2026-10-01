"use client";

import { useState } from "react";

import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  Clock3,
  FileText,
  HardDrive,
  Mail,
  MessageCircle,
  Pencil,
  Plus,
  ShieldCheck,
  Tags,
  Trash2,
  UploadCloud,
  Users,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import type { AdminPanel } from "./admin-shell";

import { initialSources, traffic30Days, type Comment, type Post, type Schedule } from "./mock-data";

type Props = {
  posts: Post[];
  comments: Comment[];
  schedules: Schedule[];
  onOpen: (panel: AdminPanel) => void;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  onBackup: () => void;
};

function PanelCard({
  title,
  icon: Icon,
  action,
  children,
  className = "",
}: {
  title: string;
  icon: typeof Activity;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`admin-panel ${className}`}>
      <div className="admin-panel-heading">
        <h2>
          <Icon size={17} aria-hidden="true" />
          {title}
        </h2>
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
    <PanelCard
      title="流量走势分析 (PV / UV)"
      icon={BarChart3}
      className="admin-chart-panel"
      action={
        <fieldset className="admin-range">
          <legend className="sr-only">图表时间范围</legend>
          <button
            type="button"
            className={range === "7d" ? "is-selected" : ""}
            aria-pressed={range === "7d"}
            onClick={() => {
              setRange("7d");
              setActive(null);
            }}
          >
            近 7 天
          </button>
          <button
            type="button"
            className={range === "30d" ? "is-selected" : ""}
            aria-pressed={range === "30d"}
            onClick={() => {
              setRange("30d");
              setActive(null);
            }}
          >
            近 30 天
          </button>
        </fieldset>
      }
    >
      <div className="admin-chart-wrap">
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
                tabIndex={0}
                aria-label={`${point.date}，${point.visits.toLocaleString()} 次访问`}
                onMouseEnter={() => setActive(index)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActive(index);
                  }
                }}
              />
            </g>
          ))}
        </svg>
        {active !== null && (
          <output className="admin-chart-tooltip">
            {points[active].date} · {points[active].visits.toLocaleString()} 次访问
          </output>
        )}
      </div>
    </PanelCard>
  );
}

export function AdminDashboard({
  posts,
  comments,
  schedules,
  onOpen,
  onApprove,
  onDelete,
  onBackup,
}: Props) {
  const pending = comments.filter((comment) => comment.status === "待审核");
  const stats = [
    { label: "总访问量", value: "128,942", trend: "+18.6%", note: "较上周", icon: BarChart3 },
    { label: "本周访客", value: "8,432", trend: "+12.3%", note: "较上周", icon: Users },
    {
      label: "已发布文章",
      value: String(posts.filter((post) => post.status === "已发布").length),
      trend: "本期",
      note: "篇文章",
      icon: FileText,
    },
    {
      label: "草稿箱",
      value: String(posts.filter((post) => post.status === "草稿").length),
      trend: "待编辑",
      note: "篇草稿",
      icon: Pencil,
    },
    {
      label: "待审核评论",
      value: String(pending.length),
      trend: "待处理",
      note: "条评论",
      icon: MessageCircle,
    },
    { label: "邮件订阅", value: "2,156", trend: "+8.7%", note: "较上周", icon: Mail },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">OVERVIEW / 001</p>
          <h1>仪表盘概览</h1>
          <p>欢迎回来。这是你的模拟运营概览。</p>
        </div>
        <div className="admin-page-actions">
          <span className="admin-date">
            <CalendarDays size={15} aria-hidden="true" />
            演示数据 · 2025-05-14 至 2025-05-20
          </span>
          <Button size="sm" variant="secondary" onClick={() => onOpen("compose")}>
            <Plus size={15} aria-hidden="true" />
            快速发文
          </Button>
        </div>
      </div>
      <div className="admin-stats">
        {stats.map((stat) => (
          <Card className="admin-stat" key={stat.label}>
            <div className="admin-stat-top">
              <span>{stat.label}</span>
              <stat.icon size={18} aria-hidden="true" />
            </div>
            <strong>{stat.value}</strong>
            <div className="admin-stat-bottom">
              <span>{stat.trend}</span>
              <small>{stat.note}</small>
            </div>
          </Card>
        ))}
      </div>
      <div className="admin-analysis-grid">
        <TrafficChart />
        <PanelCard title="访客来源占比" icon={Users} className="admin-source-panel">
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
            <Button variant="ghost" size="sm" onClick={() => onOpen("analytics")}>
              详细分析 <ArrowRight size={14} />
            </Button>
          </div>
        </PanelCard>
      </div>
      <div className="admin-lower-grid">
        <PanelCard
          title={`待审核评论 · ${pending.length}`}
          icon={MessageCircle}
          action={
            <Button variant="ghost" size="sm" onClick={() => onOpen("comments")}>
              查看全部 <ArrowUpRight size={14} />
            </Button>
          }
        >
          <div className="admin-comment-list">
            {pending.length ? (
              pending.slice(0, 5).map((comment) => (
                <div className="admin-comment" key={comment.id}>
                  <div className="admin-comment-content">
                    <div className="admin-comment-meta">
                      <strong>{comment.author}</strong>
                      <span>{comment.time}</span>
                    </div>
                    <p>{comment.content}</p>
                    <small>在文章《{comment.postTitle}》</small>
                  </div>
                  <div className="admin-comment-actions">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onApprove(comment.id)}
                      aria-label={`通过 ${comment.author} 的评论`}
                    >
                      <Check size={14} />
                      通过
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`删除 ${comment.author} 的评论`}
                      onClick={() => onDelete(comment.id)}
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
        </PanelCard>
        <div className="admin-side-stack">
          <PanelCard
            title="定时发布计划"
            icon={Clock3}
            action={
              <Button variant="ghost" size="sm" onClick={() => onOpen("schedule")}>
                管理 <ArrowUpRight size={14} />
              </Button>
            }
          >
            <div className="admin-schedule-list">
              {schedules.length ? (
                schedules.map((schedule) => (
                  <div className="admin-schedule" key={schedule.id}>
                    <div>
                      <strong>{schedule.title}</strong>
                      <small>{schedule.date}</small>
                    </div>
                    <span>准备就绪</span>
                  </div>
                ))
              ) : (
                <p className="admin-empty">暂无排期。</p>
              )}
            </div>
          </PanelCard>
          <PanelCard title="站点运行健康度" icon={Activity}>
            <div className="admin-health">
              <div>
                <HardDrive size={17} />
                <span>磁盘使用</span>
                <strong>3.2 / 10 GB</strong>
              </div>
              <div>
                <Activity size={17} />
                <span>备份健康度</span>
                <strong>96 分</strong>
              </div>
              <div>
                <Check size={17} />
                <span>备份状态</span>
                <strong>正常</strong>
              </div>
              <div>
                <ShieldCheck size={17} />
                <span>安全防御</span>
                <strong>未发现风险</strong>
              </div>
            </div>
          </PanelCard>
        </div>
      </div>
      <Card className="admin-quick">
        <div>
          <strong>快捷管理通道</strong>
          <span>常用模拟操作</span>
        </div>
        <div className="admin-quick-buttons">
          <Button size="sm" variant="secondary" onClick={() => onOpen("compose")}>
            <Plus size={15} />
            撰写文章
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onOpen("upload")}>
            <UploadCloud size={15} />
            上传媒体
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onOpen("categories")}>
            <Tags size={15} />
            分类标签
          </Button>
          <Button size="sm" variant="secondary" onClick={onBackup}>
            <ShieldCheck size={15} />
            模拟备份
          </Button>
        </div>
      </Card>
    </div>
  );
}
