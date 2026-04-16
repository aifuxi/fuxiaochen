"use client";

import { formatDistanceToNow } from "date-fns";
import useSWR from "swr";

import { CmsActivityList, CmsEmptyState, CmsFeedbackPanel, CmsSummaryGrid } from "@/components/cms/cms-dashboard-panels";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "@/lib/dashboard/dashboard-dto";

const statusVariantMap: Record<
  string,
  "destructive" | "info" | "success" | "warning"
> = {
  Archived: "info",
  Draft: "warning",
  Published: "success",
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
      <CmsSummaryGrid
        className={`
          grid gap-4
          md:grid-cols-2
          xl:grid-cols-4
        `}
        items={stats.map((stat) => ({
          description: stat.deltaLabel,
          label: stat.title,
          value: stat.value,
        }))}
      />

      <div
        className={`
          grid gap-6
          xl:grid-cols-[1.2fr_0.8fr]
        `}
      >
        <section
          className={`
            scroll-mt-28 rounded-2xl border
            border-[color:var(--color-line-default)]
            bg-[color:var(--color-surface-1)]
            p-6
          `}
        >
          <div className="space-y-2">
            <h2 className="font-serif text-2xl tracking-[-0.04em] text-foreground">
              最近文章
            </h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            最新更新的文章一览。
          </p>
          <div className="mt-6 space-y-4">
            {isValidating && !isLoading ? (
              <p className="font-mono-tech text-xs tracking-wider text-muted uppercase">
                刷新中
              </p>
            ) : null}
            <RecentArticlesTable articles={recentArticles} />
          </div>
        </section>

        <CmsActivityList
          className="h-full"
          description="最近的内容、评论和站点变更。"
          items={activityFeed}
        />
      </div>
    </div>
  );
}

function RecentArticlesTable({
  articles,
}: {
  articles: DashboardArticleDto[];
}) {
  if (articles.length === 0) {
    return (
      <CmsEmptyState
        description="新的文章会显示在这里。"
        title="暂无文章"
      />
    );
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
            className={`
              h-40 animate-pulse rounded-2xl border
              border-[color:var(--color-line-default)]
              bg-[color:var(--color-surface-2)]
            `}
          />
        ))}
      </div>
      <div
        className={`
          grid gap-6
          xl:grid-cols-[1.2fr_0.8fr]
        `}
      >
        <div
          className={`
            h-96 animate-pulse rounded-2xl border
            border-[color:var(--color-line-default)]
            bg-[color:var(--color-surface-2)]
          `}
        />
        <div
          className={`
            h-96 animate-pulse rounded-2xl border
            border-[color:var(--color-line-default)]
            bg-[color:var(--color-surface-2)]
          `}
        />
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
    <CmsFeedbackPanel
      action={
        <Button type="button" variant="outline" onClick={onRetry}>
          重试
        </Button>
      }
      className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center"
      description={error.message || "加载仪表盘失败。"}
      title="仪表盘加载失败"
    />
  );
}

function formatRelativeTime(value: string) {
  return formatDistanceToNow(new Date(value), {
    addSuffix: true,
  });
}
