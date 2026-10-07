"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, useDataTableState } from "@/components/ui/data-table";
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@/components/ui/tabs";
import {
  analyticsRanges,
  durationLabel,
  type AnalyticsRange,
  type AnalyticsSnapshot,
} from "@/lib/analytics/schema";
import { trendGeometry } from "@/lib/analytics/trend";
import { postTime } from "@/lib/posts/schema";

import { AnalyticsQueryStatus, useAnalytics } from "./analytics-query";
import { CollectionStatus } from "./collection-status";
import "./admin-analytics.css";

const number = (value: number | null) =>
  value === null ? "暂无可用数据" : value.toLocaleString("zh-CN");
type RankedArticle = AnalyticsSnapshot["articles"][number] & { rank: number };

const columns: ColumnDef<RankedArticle>[] = [
  {
    id: "rank",
    header: "排名",
    accessorKey: "rank",
    enableSorting: false,
    cell: ({ row }) => {
      const article = row.original;
      return (
        <>
          {" "}
          <span className={`analytics-rank ${article.rank <= 3 ? "is-leading" : ""}`}>
            {article.rank}
          </span>{" "}
        </>
      );
    },
  },
  {
    id: "title",
    header: "热门文章标题",
    accessorKey: "title",
    enableSorting: true,
    meta: { rowHeader: true },
    cell: ({ row }) => {
      const article = row.original;
      return <> {article.title} </>;
    },
  },
  {
    id: "pv",
    header: "PV",
    accessorKey: "pv",
    enableSorting: true,
    cell: ({ row }) => {
      const article = row.original;
      return <> {number(article.pv)} </>;
    },
  },
  {
    id: "uv",
    header: "UV",
    accessorKey: "uv",
    enableSorting: true,
    cell: ({ row }) => {
      const article = row.original;
      return <> {number(article.uv)} </>;
    },
  },
  {
    id: "rate",
    header: "完读率",
    accessorKey: "rate",
    enableSorting: true,
    cell: ({ row }) => {
      const article = row.original;
      return (
        <>
          {" "}
          <span className="analytics-rate">{article.rate.toFixed(1)}%</span>{" "}
        </>
      );
    },
  },
];

function AnalyticsContent({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  const range = snapshot.range;
  const tableState = useDataTableState();
  const rankedArticles = snapshot.articles.map((article, index) => ({
    ...article,
    rank: index + 1,
  }));
  const [active, setActive] = useState<number | null>(null);
  const metrics = [
    { key: "pv" as const, label: "总浏览量 (PV)", value: number(snapshot.metrics.pv) },
    { key: "uv" as const, label: "独立访客 (UV)", value: number(snapshot.metrics.uv) },
    {
      key: "durationMs" as const,
      label: "平均阅读时长",
      value: durationLabel(snapshot.metrics.durationMs),
    },
    {
      key: "bounce" as const,
      label: "整站跳出率",
      value: snapshot.metrics.bounce === null ? "—" : `${snapshot.metrics.bounce.toFixed(1)}%`,
    },
  ];
  const { max, points, path } = trendGeometry(snapshot.trend);
  const selected = active === null ? null : points[active];

  return (
    <div className="analytics-sections">
      <div className="analytics-stats">
        {metrics.map(({ key, label, value }) => (
          <Card className="analytics-stat" key={label}>
            <div className="analytics-stat-heading">
              <span>{label}</span>
            </div>
            <strong>{value}</strong>
            <div
              className={`analytics-change ${snapshot.changes[key] === null || snapshot.changes[key] === 0 || (key === "bounce" ? snapshot.changes[key] > 0 : snapshot.changes[key] < 0) ? "is-muted" : ""}`}
            >
              <span>
                {snapshot.changes[key] === null ? (
                  "暂无可比数据"
                ) : (
                  <>
                    {snapshot.changes[key] !== 0 &&
                      (snapshot.changes[key] < 0 ? (
                        <ArrowDown size={13} aria-hidden="true" />
                      ) : (
                        <ArrowUp size={13} aria-hidden="true" />
                      ))}
                    {snapshot.changes[key] === 0
                      ? "持平"
                      : snapshot.changes[key] > 0
                        ? "上升"
                        : "下降"}{" "}
                    {Math.abs(snapshot.changes[key]).toFixed(1)}%
                  </>
                )}
              </span>
              <small>环比前一等长区间</small>
            </div>
          </Card>
        ))}
      </div>
      <div className="analytics-grid">
        <Card className="admin-panel">
          <div className="admin-panel-heading">
            <h2>访问趋势</h2>
          </div>
          <div className="admin-panel-body">
            <div className="analytics-legend">
              <span>
                <i className="analytics-pv" aria-hidden="true" />
                浏览量 (PV) · 实线
              </span>
              <span>
                <i className="analytics-uv" aria-hidden="true" />
                访客数 (UV) · 虚线
              </span>
            </div>
            <div className="analytics-chart-detail" aria-live="polite">
              {selected
                ? `${selected.date} · PV ${number(selected.pv)} · UV ${number(selected.uv)}`
                : "悬停、点击或聚焦数据点查看详情"}
            </div>
            <section className="analytics-chart-scroll" aria-label="访问趋势图，可横向滚动">
              <div
                className="analytics-chart-frame"
                style={{
                  minWidth: `max(540px, ${points.length * 51}px * var(--admin-chart-touch, 0))`,
                }}
              >
                <svg
                  viewBox="0 0 630 270"
                  className="analytics-chart"
                  aria-label="浏览量与每日独立访客趋势"
                >
                  <title>浏览量与每日独立访客趋势</title>
                  {[0.25, 0.5, 0.75, 1].map((ratio) => (
                    <g key={ratio}>
                      <line
                        x1="54"
                        x2="600"
                        y1={228 - ratio * 196}
                        y2={228 - ratio * 196}
                        stroke="var(--color-outline)"
                        strokeDasharray="4 5"
                      />
                      <text x="45" y={232 - ratio * 196} textAnchor="end">
                        {number(max * ratio)}
                      </text>
                    </g>
                  ))}
                  <path
                    d={path("pvY")}
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="2.5"
                  />
                  <path
                    d={path("uvY")}
                    fill="none"
                    stroke="var(--color-success)"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                  />
                  {points.map((point, i) => (
                    <g key={point.date}>
                      {(i === 0 ||
                        i === points.length - 1 ||
                        i % Math.ceil(points.length / 6) === 0) && (
                        <text x={point.x} y="255" textAnchor="middle">
                          {point.date.slice(5)}
                        </text>
                      )}
                      {point.pvY !== null && (
                        <circle cx={point.x} cy={point.pvY} r="3" fill="var(--color-primary)" />
                      )}
                      {point.uvY !== null && (
                        <circle cx={point.x} cy={point.uvY} r="3" fill="var(--color-success)" />
                      )}
                    </g>
                  ))}
                </svg>
                {points.map((point, i) => (
                  <Button
                    key={point.date}
                    variant="ghost"
                    aria-label={`${point.date}，浏览量 ${number(point.pv)}，访客数 ${number(point.uv)}`}
                    className="analytics-data-point"
                    style={{
                      left: `${(point.x / 630) * 100}%`,
                      width: `${(546 / Math.max(1, points.length - 1) / 630) * 100}%`,
                    }}
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    onClick={() => setActive(i)}
                  />
                ))}
              </div>
            </section>
            <p className="analytics-footnote">
              采集开始前的日期留空，不表示零访问；首次采集当天可能只有部分数据。每日 UV
              按日去重，周期 UV 按整个区间去重；仅包含成功上报的浏览器访问。
            </p>
          </div>
        </Card>
        <Card className="admin-panel">
          <div className="admin-panel-heading">
            <h2>设备分布</h2>
          </div>
          <div className="admin-panel-body analytics-devices">
            {snapshot.devices.map(({ name, percent }, i) => (
              <div key={name} className="analytics-device">
                <div>
                  <span>{name}</span>
                  <strong>{snapshot.metrics.pv ? `${percent.toFixed(1)}%` : "—"}</strong>
                </div>
                <progress
                  max={100}
                  value={percent}
                  aria-label={`${name}访问占比`}
                  className={`admin-progress analytics-progress-${i === 0 ? "pv" : i === 1 ? "uv" : "neutral"}`}
                />
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="admin-panel">
        <div className="admin-panel-heading">
          <h2>访问来源</h2>
        </div>
        <div className="admin-panel-body analytics-devices">
          {snapshot.sources.length ? (
            snapshot.sources.map((source) => (
              <div className="analytics-device" key={source.name}>
                <div>
                  <span>{source.name}</span>
                  <strong>
                    {source.percent.toFixed(1)}% · {number(source.count)} 次
                  </strong>
                </div>
                <progress
                  max={100}
                  value={source.percent}
                  aria-label={`${source.name}访问占比`}
                  className="admin-progress analytics-progress-pv"
                />
              </div>
            ))
          ) : (
            <p>暂无来源数据。</p>
          )}
        </div>
      </Card>
      <Card className="admin-panel analytics-ranking">
        <div className="admin-panel-heading">
          <h2>热门文章</h2>
        </div>
        <DataTable
          {...tableState}
          data={rankedArticles}
          columns={columns}
          getRowId={(article) => article.id}
          paginate={false}
          caption={`${analyticsRanges.find((item) => item.value === range)?.label}热门文章排行榜`}
          tableClassName="analytics-table"
          emptyState={<p className="admin-business-feedback">暂无文章访问记录。</p>}
        />
      </Card>
    </div>
  );
}

export function AdminAnalytics() {
  const [range, setRange] = useState<AnalyticsRange>("30d");
  const result = useAnalytics(range);
  const data = result.data;
  return (
    <Tabs
      value={range}
      onValueChange={(value) => {
        if (value === "7d" || value === "30d" || value === "quarter") setRange(value);
      }}
      className="admin-analytics"
    >
      <div className="admin-page-heading">
        <div>
          <h1>数据分析</h1>
          <p>查看访问趋势、来源、设备与文章表现。</p>
        </div>
      </div>
      <div className="analytics-toolbar">
        <TabsList size="compact" aria-label="统计时间范围">
          {analyticsRanges.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <p className="analytics-period">
          {data
            ? `${postTime(data.start, true)} 至 ${postTime(data.end)}（北京时间）`
            : result.error
              ? "统计查询失败"
              : "正在查询统计区间…"}
        </p>
      </div>
      <AnalyticsQueryStatus
        loading={result.isPending}
        error={result.error}
        hasData={!!data}
        reload={() => void result.refetch()}
      />
      {data && (
        <TabsPanel value={range}>
          <CollectionStatus collection={data.collection} incomplete={data.incomplete} />
          <AnalyticsContent key={range} snapshot={data} />
          <p className="analytics-footnote">
            平均阅读时长只计算文章页面可见停留；跳出率只计算已结束且停留不足10秒、仅浏览一页的会话。完读要求正文进度达到90%且停留至少10秒。
          </p>
        </TabsPanel>
      )}
    </Tabs>
  );
}
