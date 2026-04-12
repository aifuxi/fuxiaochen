"use client";

import { formatDistanceToNow } from "date-fns";
import { Activity, FileText, RefreshCw } from "lucide-react";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/ui/table";
import {
  getDashboard,
  type DashboardApiError,
} from "@/lib/dashboard/dashboard-client";
import type {
  DashboardArticleDto,
  DashboardMetricDto,
} from "@/lib/dashboard/dashboard-dto";

const statusVariantMap: Record<
  string,
  "destructive" | "info" | "success" | "warning"
> = {
  Archived: "info",
  Draft: "warning",
  Published: "success",
};

const toneVariantMap: Record<
  DashboardMetricDto["tone"],
  "info" | "success" | "warning"
> = {
  info: "info",
  success: "success",
  warning: "warning",
};

export function CmsDashboardOverview() {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    ["dashboard"],
    getDashboard,
  );

  if (isLoading && !data) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <DashboardError error={error} onRetry={() => void mutate()} />;
  }

  const stats = data?.stats ?? [];
  const recentArticles = data?.recentArticles ?? [];
  const activityFeed = data?.activityFeed ?? [];

  return (
    <div className="space-y-6">
      <div
        className={`
          grid gap-4
          md:grid-cols-2
          xl:grid-cols-4
        `}
      >
        {stats.map((stat) => (
          <StatCard key={stat.key} stat={stat} />
        ))}
      </div>

      <div
        className={`
          grid gap-6
          xl:grid-cols-[1.2fr_0.8fr]
        `}
      >
        <div className="glass-card rounded-2xl border border-white/8 p-6">
          <div
            className={`
              mb-4 flex flex-col gap-3
              sm:flex-row sm:items-center sm:justify-between
            `}
          >
            <h2 className="font-serif text-2xl">最近文章</h2>
            <div className="flex items-center gap-3">
              {isValidating && !isLoading ? (
                <span className="inline-flex items-center gap-2 text-xs text-muted">
                  <RefreshCw className="size-3 animate-spin" />
                  刷新中
                </span>
              ) : null}
              <span className="font-mono-tech text-xs tracking-wider text-muted uppercase">
                最新更新
              </span>
            </div>
          </div>
          <RecentArticlesTable articles={recentArticles} />
        </div>

        <Card className="space-y-4 rounded-2xl">
          <div className="flex items-center justify-between gap-3">
            <div className="type-label">活动动态</div>
            <Activity className="size-4 text-muted" />
          </div>
          {activityFeed.length === 0 ? (
            <EmptyState message="暂无活动记录。" />
          ) : (
            <ul className="space-y-3 text-sm leading-6 text-muted">
              {activityFeed.map((item, index) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-white/6 bg-white/3 px-4 py-3"
                >
                  <span className="text-primary-accent mr-2">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item.message}
                  <div className="mt-1 text-xs text-muted">
                    {formatRelativeTime(item.occurredAt)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatCard({ stat }: { stat: DashboardMetricDto }) {
  return (
    <Card className="">
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="type-label">{stat.title}</div>
          <Badge variant={toneVariantMap[stat.tone]}>{stat.deltaLabel}</Badge>
        </div>
        <div className="font-serif text-5xl tracking-[-0.06em]">
          {stat.value}
        </div>
      </div>
    </Card>
  );
}

function RecentArticlesTable({
  articles,
}: {
  articles: DashboardArticleDto[];
}) {
  if (articles.length === 0) {
    return <EmptyState message="暂无文章。" />;
  }

  return (
    <Table>
      <TableRoot>
        <TableHead>
          <tr>
            <TableHeaderCell>标题</TableHeaderCell>
            <TableHeaderCell>分类</TableHeaderCell>
            <TableHeaderCell>状态</TableHeaderCell>
            <TableHeaderCell>更新时间</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {articles.map((article) => (
            <TableRow key={article.id}>
              <TableCell>{article.title}</TableCell>
              <TableCell>{article.category}</TableCell>
              <TableCell>
                <Badge variant={statusVariantMap[article.status] ?? "info"}>
                  {article.status}
                </Badge>
              </TableCell>
              <TableCell>{formatRelativeTime(article.updatedAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableRoot>
    </Table>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div
        className={`
          grid gap-4
          md:grid-cols-2
          xl:grid-cols-4
        `}
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-2xl bg-white/5"
          />
        ))}
      </div>
      <div
        className={`
          grid gap-6
          xl:grid-cols-[1.2fr_0.8fr]
        `}
      >
        <div className="h-96 animate-pulse rounded-2xl bg-white/5" />
        <div className="h-96 animate-pulse rounded-2xl bg-white/5" />
      </div>
    </div>
  );
}

function DashboardError({
  error,
  onRetry,
}: {
  error: DashboardApiError;
  onRetry: () => void;
}) {
  return (
    <div
      className={`
        glass-card flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-white/8
      `}
    >
      <FileText className="size-10 text-muted" />
      <p className="max-w-md text-center text-sm text-muted">
        {error.message || "加载仪表盘失败。"}
      </p>
      <Button type="button" variant="outline" onClick={onRetry}>
        重试
      </Button>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center text-sm text-muted">
      <FileText className="size-8" />
      <p>{message}</p>
    </div>
  );
}

function formatRelativeTime(value: string) {
  return formatDistanceToNow(new Date(value), {
    addSuffix: true,
  });
}
