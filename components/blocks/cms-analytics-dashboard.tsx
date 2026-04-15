"use client";

import { RefreshCw } from "lucide-react";
import React from "react";
import useSWR from "swr";

import { CmsEmptyState, CmsFeedbackPanel, CmsSectionPanel, CmsSummaryGrid } from "@/components/cms/cms-dashboard-panels";
import { Button } from "@/components/ui/button";
import type {
  AnalyticsDailyMetricDto,
  AnalyticsPeriod,
} from "@/lib/analytics/analytics-dto";
import { getAnalyticsDashboard } from "@/lib/analytics/analytics-client";

const PERIOD_OPTIONS: Array<{ label: string; value: AnalyticsPeriod }> = [
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
];

export function CmsAnalyticsDashboard() {
  const [period, setPeriod] = React.useState<AnalyticsPeriod>(30);
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    ["analytics", period],
    () => getAnalyticsDashboard({ period }),
    {
      keepPreviousData: true,
    },
  );

  const summary = data?.summary ?? [];
  const dailyMetrics = data?.dailyMetrics ?? [];
  const popularArticles = data?.popularArticles ?? [];

  return (
    <div className="space-y-6">
      {isLoading && summary.length === 0 ? (
        <SummarySkeleton />
      ) : (
        <CmsSummaryGrid
          className={`
            grid gap-4
            md:grid-cols-2
            xl:grid-cols-5
          `}
          items={summary.map((stat) => ({
            description: stat.deltaLabel,
            label: stat.title,
            value: stat.formattedValue,
          }))}
        />
      )}

      <CmsSectionPanel
        description="所选报告期间的每日浏览量。"
        title="流量概览"
      >
        <div
          className={`
            mb-6 flex flex-col gap-4
            sm:flex-row sm:items-center sm:justify-between
          `}
        >
          <div className="flex flex-wrap items-center gap-2">
            {isValidating && !isLoading ? (
              <span className="inline-flex items-center gap-2 text-xs text-muted">
                <RefreshCw className="size-3 animate-spin" />
                刷新中
              </span>
            ) : null}
            {PERIOD_OPTIONS.map((option) => (
              <Button
                key={option.value}
                className={period === option.value ? "px-3 py-1 text-xs" : "px-3 py-1 text-xs text-muted"}
                size="sm"
                type="button"
                variant={period === option.value ? "primary" : "ghost"}
                onClick={() => setPeriod(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {error ? (
          <CmsFeedbackPanel
            action={
              <Button type="button" variant="outline" onClick={() => void mutate()}>
                重试
              </Button>
            }
            className="flex min-h-[240px] flex-col items-center justify-center gap-4 text-center"
            description={error.message || "加载分析数据失败。"}
            title="分析数据加载失败"
          />
        ) : (
          <TrafficChart dailyMetrics={dailyMetrics} isLoading={isLoading} />
        )}
      </CmsSectionPanel>

      <div
        className={`
          grid gap-6
          xl:grid-cols-2
        `}
      >
        <CmsSectionPanel description="最近 7 天的增长变化。" title="增长趋势">
          <GrowthTrend dailyMetrics={dailyMetrics} isLoading={isLoading} />
        </CmsSectionPanel>
        <CmsSectionPanel description="按阅读量排序的热门内容。" title="热门文章">
          {isLoading && popularArticles.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className={`
                  h-16 animate-pulse rounded-xl border
                  border-[color:var(--color-line-default)]
                  bg-[color:var(--color-surface-2)]
                `}
              />
              ))}
            </div>
          ) : popularArticles.length === 0 ? (
            <CmsEmptyState
              description="这一时段还没有文章流量记录。"
              title="暂无文章"
            />
          ) : (
            <ul className="space-y-2">
              {popularArticles.map((item, index) => (
                <li
                  key={item.id}
                  className={`
                    flex items-center gap-4 border-b border-white/8 py-4
                    last:border-b-0
                  `}
                >
                  <div className={getRankClassName(index)}>{index + 1}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-foreground">{item.title}</div>
                    <div className="mt-1 text-xs text-muted">
                      {item.formattedViews} 阅读 · {item.likes} 喜欢 · {item.comments} 评论
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CmsSectionPanel>
      </div>
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div
      className={`
        grid gap-4
        md:grid-cols-2
        xl:grid-cols-5
      `}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className={`
            rounded-2xl border
            border-[color:var(--color-line-default)]
            bg-[color:var(--color-surface-2)]
            p-5
          `}
        >
          <div
            className={`
              mx-auto mb-3 h-9 w-24 animate-pulse rounded-lg border
              border-[color:var(--color-line-default)]
              bg-[color:var(--color-surface-1)]
            `}
          />
          <div
            className={`
              mx-auto mb-3 h-4 w-28 animate-pulse rounded border
              border-[color:var(--color-line-default)]
              bg-[color:var(--color-surface-1)]
            `}
          />
          <div
            className={`
              mx-auto h-7 w-20 animate-pulse rounded-full border
              border-[color:var(--color-line-default)]
              bg-[color:var(--color-surface-1)]
            `}
          />
        </div>
      ))}
    </div>
  );
}

function TrafficChart({
  dailyMetrics,
  isLoading,
}: {
  dailyMetrics: AnalyticsDailyMetricDto[];
  isLoading: boolean;
}) {
  if (isLoading && dailyMetrics.length === 0) {
    return (
      <div
        className={`
          h-[240px] animate-pulse rounded-xl border
          border-[color:var(--color-line-default)]
          bg-[color:var(--color-surface-2)]
        `}
      />
    );
  }

  if (dailyMetrics.length === 0) {
    return (
      <CmsEmptyState
        description="所选时段还没有每日流量数据。"
        title="暂无每日流量"
      />
    );
  }

  const maxViews = Math.max(...dailyMetrics.map((metric) => metric.totalViews), 1);
  const labelInterval = Math.max(Math.ceil(dailyMetrics.length / 7), 1);

  return (
    <div className="h-[260px] border-b border-white/8 pb-4">
      <div
        className="grid h-full items-end gap-1"
        style={{
          gridTemplateColumns: `repeat(${dailyMetrics.length}, minmax(3px, 1fr))`,
        }}
      >
        {dailyMetrics.map((metric, index) => {
          const height = Math.max((metric.totalViews / maxViews) * 190, metric.totalViews > 0 ? 10 : 2);
          const shouldShowLabel = index === 0 || index === dailyMetrics.length - 1 || index % labelInterval === 0;

          return (
            <div key={metric.date} className="flex min-w-0 flex-col items-center gap-2">
              <div
                aria-label={`${metric.label}: ${metric.totalViews} views`}
                className="w-full rounded-t-lg bg-[linear-gradient(to_top,#10b981,rgba(16,185,129,0.6))]"
                style={{ height }}
                title={`${metric.label}: ${metric.totalViews} views`}
              />
              <div className="h-4 text-[10px] text-muted">{shouldShowLabel ? metric.label : ""}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GrowthTrend({
  dailyMetrics,
  isLoading,
}: {
  dailyMetrics: AnalyticsDailyMetricDto[];
  isLoading: boolean;
}) {
  if (isLoading && dailyMetrics.length === 0) {
    return (
      <div
        className={`
          h-64 animate-pulse rounded-xl border
          border-[color:var(--color-line-default)]
          bg-[color:var(--color-surface-2)]
        `}
      />
    );
  }

  if (dailyMetrics.length === 0) {
    return (
      <CmsEmptyState
        description="所选时段还没有增长指标。"
        title="暂无增长指标"
      />
    );
  }

  const recentMetrics = dailyMetrics.slice(-7);

  return (
    <div className="space-y-3">
      {recentMetrics.map((metric) => (
        <div
          key={metric.date}
          className={`
            rounded-xl border
            border-[color:var(--color-line-default)]
            bg-[color:var(--color-surface-2)]
            px-4 py-3
          `}
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-foreground">{metric.label}</span>
            <span className="font-mono-tech text-xs text-muted">{metric.newVisitors} 访客</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-muted">
            <span>{metric.totalViews} 阅读</span>
            <span>{metric.totalComments} 评论</span>
            <span>{metric.totalSubscribers} 订阅</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function getRankClassName(index: number) {
  const baseClassName = `
    flex h-8 w-8 items-center justify-center rounded-full border
    border-[color:var(--color-line-default)]
    bg-[color:var(--color-surface-1)] text-sm font-semibold text-muted
  `;

  if (index === 0) {
    return `${baseClassName} text-foreground`;
  }

  if (index === 1) {
    return baseClassName;
  }

  if (index === 2) {
    return baseClassName;
  }

  return baseClassName;
}
