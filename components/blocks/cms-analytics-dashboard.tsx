"use client";

import { BarChart3, RefreshCw } from "lucide-react";
import React from "react";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import type {
  AnalyticsDailyMetricDto,
  AnalyticsPeriod,
  AnalyticsSummaryMetricDto,
} from "@/lib/analytics/analytics-dto";
import {
  getAnalyticsDashboard,
  type AnalyticsApiError,
} from "@/lib/analytics/analytics-client";

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
      <div className={`
        grid gap-4
        md:grid-cols-2
        xl:grid-cols-5
      `}>
        {isLoading && summary.length === 0
          ? Array.from({ length: 5 }, (_, index) => <SummarySkeleton key={index} />)
          : summary.map((stat) => <SummaryCard key={stat.key} stat={stat} />)}
      </div>

      <div className="glass-card rounded-2xl border border-white/8 p-6">
        <div className={`
          mb-6 flex flex-col gap-4
          sm:flex-row sm:items-center sm:justify-between
        `}>
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <span className="text-primary">◌</span>
              Traffic Overview
            </h2>
            <p className="mt-1 text-sm text-muted">Daily views from the selected reporting window.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isValidating && !isLoading ? (
              <span className="inline-flex items-center gap-2 text-xs text-muted">
                <RefreshCw className="size-3 animate-spin" />
                Refreshing
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
          <AnalyticsError error={error} onRetry={() => void mutate()} />
        ) : (
          <TrafficChart dailyMetrics={dailyMetrics} isLoading={isLoading} />
        )}
      </div>

      <div className={`
        grid gap-6
        xl:grid-cols-2
      `}>
        <div className="glass-card rounded-2xl border border-white/8 p-6">
          <h2 className="mb-4 text-lg font-semibold">Growth Trend</h2>
          <GrowthTrend dailyMetrics={dailyMetrics} isLoading={isLoading} />
        </div>
        <div className="glass-card rounded-2xl border border-white/8 p-6">
          <h2 className="mb-4 text-lg font-semibold">Popular Articles</h2>
          {isLoading && popularArticles.length === 0 ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-xl bg-white/5" />
              ))}
            </div>
          ) : popularArticles.length === 0 ? (
            <EmptyState message="No article traffic has been recorded yet." />
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
                      {item.formattedViews} views · {item.likes} likes · {item.comments} comments
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ stat }: { stat: AnalyticsSummaryMetricDto }) {
  return (
    <div className="glass-card rounded-2xl border border-white/8 p-5 text-center">
      <div className="mb-1 font-mono text-3xl font-bold text-foreground">{stat.formattedValue}</div>
      <div className="mb-2 text-xs text-muted">{stat.title}</div>
      <span className={getToneClassName(stat.tone)}>{stat.deltaLabel}</span>
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="glass-card rounded-2xl border border-white/8 p-5">
      <div className="mx-auto mb-3 h-9 w-24 animate-pulse rounded-lg bg-white/5" />
      <div className="mx-auto mb-3 h-4 w-28 animate-pulse rounded bg-white/5" />
      <div className="mx-auto h-7 w-20 animate-pulse rounded-full bg-white/5" />
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
    return <div className="h-[240px] animate-pulse rounded-xl bg-white/5" />;
  }

  if (dailyMetrics.length === 0) {
    return <EmptyState message="No daily traffic data is available for this period." />;
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
    return <div className="h-64 animate-pulse rounded-xl bg-white/5" />;
  }

  if (dailyMetrics.length === 0) {
    return <EmptyState message="No growth metrics are available for this period." />;
  }

  const recentMetrics = dailyMetrics.slice(-7);

  return (
    <div className="space-y-3">
      {recentMetrics.map((metric) => (
        <div key={metric.date} className="rounded-xl border border-white/8 bg-white/3 px-4 py-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-foreground">{metric.label}</span>
            <span className="font-mono-tech text-xs text-muted">{metric.newVisitors} visitors</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-muted">
            <span>{metric.totalViews} views</span>
            <span>{metric.totalComments} comments</span>
            <span>{metric.totalSubscribers} subscribers</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsError({
  error,
  onRetry,
}: {
  error: AnalyticsApiError;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 text-center">
      <BarChart3 className="size-10 text-muted" />
      <p className="max-w-md text-sm text-muted">{error.message || "Failed to load analytics."}</p>
      <Button type="button" variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center text-sm text-muted">
      <BarChart3 className="size-8" />
      <p>{message}</p>
    </div>
  );
}

function getToneClassName(tone: AnalyticsSummaryMetricDto["tone"]) {
  const baseClassName = "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs";

  if (tone === "success") {
    return `${baseClassName} bg-primary/10 text-primary`;
  }

  if (tone === "warning") {
    return `${baseClassName} bg-red-500/10 text-red-400`;
  }

  return `${baseClassName} bg-sky-500/10 text-sky-400`;
}

function getRankClassName(index: number) {
  const baseClassName = "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold";

  if (index === 0) {
    return `${baseClassName} bg-primary/10 text-primary`;
  }

  if (index === 1) {
    return `${baseClassName} bg-indigo-500/10 text-indigo-400`;
  }

  if (index === 2) {
    return `${baseClassName} bg-amber-500/10 text-amber-400`;
  }

  return `${baseClassName} bg-white/6 text-muted`;
}
