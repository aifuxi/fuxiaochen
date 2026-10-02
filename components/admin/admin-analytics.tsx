"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@/components/ui/tabs";

import { analyticsRanges, analyticsSnapshots, type AnalyticsRange } from "./analytics-mock-data";
import "./admin-analytics.css";

const number = (value: number) => value.toLocaleString("zh-CN");
const deviceTypes = [
  { name: "桌面电脑", tone: "pv" },
  { name: "移动手机", tone: "uv" },
  { name: "平板设备", tone: "neutral" },
];

function AnalyticsContent({ range }: { range: AnalyticsRange }) {
  const snapshot = analyticsSnapshots[range];
  const [active, setActive] = useState<number | null>(null);
  const totalPv = snapshot.trend.reduce((sum, item) => sum + item.pv, 0);
  const metrics = [
    { label: "总浏览量 (PV)", value: number(totalPv) },
    { label: "独立访客 (UV)", value: number(snapshot.uv) },
    { label: "平均阅读时长", value: snapshot.duration },
    { label: "整站跳出率", value: snapshot.bounce },
  ];
  const max = Math.ceil(Math.max(...snapshot.trend.map((item) => item.pv)) / 2000) * 2000;
  const points = snapshot.trend.map((item, i) => ({
    ...item,
    x: 54 + (i * 546) / (snapshot.trend.length - 1),
    pvY: 228 - (item.pv / max) * 196,
    uvY: 228 - (item.uv / max) * 196,
  }));
  const path = (key: "pvY" | "uvY") =>
    points.map((point, i) => `${i ? "L" : "M"}${point.x},${point[key]}`).join(" ");
  const selected = active === null ? null : points[active];

  return (
    <div className="analytics-sections">
      <div className="analytics-stats">
        {metrics.map(({ label, value }, i) => (
          <Card className="analytics-stat" key={label}>
            <div className="analytics-stat-heading">
              <span>{label}</span>
            </div>
            <strong>{value}</strong>
            <div className="analytics-change">
              <span>
                {i === 3 ? (
                  <ArrowDown size={13} aria-hidden="true" />
                ) : (
                  <ArrowUp size={13} aria-hidden="true" />
                )}
                {i === 3 ? "下降" : "上升"} {snapshot.changes[i]}
              </span>
              <small>环比前一周期</small>
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
                <i className="analytics-pv" />
                浏览量 (PV)
              </span>
              <span>
                <i className="analytics-uv" />
                访客数 (UV)
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
                      <circle cx={point.x} cy={point.pvY} r="3" fill="var(--color-primary)" />
                      <circle cx={point.x} cy={point.uvY} r="3" fill="var(--color-success)" />
                    </g>
                  ))}
                </svg>
                {points.map((point, i) => (
                  <Button
                    key={point.date}
                    variant="ghost"
                    aria-label={`${point.date}，浏览量 ${point.pv}，访客数 ${point.uv}`}
                    className="analytics-data-point"
                    style={{
                      left: `${(point.x / 630) * 100}%`,
                      width: `${(546 / (points.length - 1) / 630) * 100}%`,
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
            <p className="analytics-footnote">每日 UV 按日去重，周期 UV 按整个统计区间去重。</p>
          </div>
        </Card>
        <Card className="admin-panel">
          <div className="admin-panel-heading">
            <h2>设备分布</h2>
          </div>
          <div className="admin-panel-body analytics-devices">
            {deviceTypes.map(({ name, tone }, i) => (
              <div key={name} className="analytics-device">
                <div>
                  <span>{name}</span>
                  <strong>{snapshot.devices[i].toFixed(1)}%</strong>
                </div>
                <progress
                  max={100}
                  value={snapshot.devices[i]}
                  aria-label={`${name}访问占比`}
                  className={`admin-progress analytics-progress-${tone}`}
                />
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="admin-panel analytics-ranking">
        <div className="admin-panel-heading">
          <h2>热门文章</h2>
        </div>
        <section
          className="admin-post-table-scroll"
          aria-label="热门文章排行榜，可横向滚动"
          // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- 允许键盘用户滚动宽表格。
          tabIndex={0}
        >
          <table className="analytics-table">
            <caption className="sr-only">
              {analyticsRanges.find((item) => item.value === range)?.label}热门文章，按 PV 降序排列
            </caption>
            <thead>
              <tr>
                <th scope="col">排名</th>
                <th scope="col">热门文章标题</th>
                <th scope="col">PV</th>
                <th scope="col">UV</th>
                <th scope="col">完读率</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.articles.map((article, i) => (
                <tr key={article.title}>
                  <td>
                    <span className={`analytics-rank ${i < 3 ? "is-leading" : ""}`}>{i + 1}</span>
                  </td>
                  <th scope="row">{article.title}</th>
                  <td>{number(article.pv)}</td>
                  <td>{number(article.uv)}</td>
                  <td>
                    <span className="analytics-rate">{article.rate.toFixed(1)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </Card>
    </div>
  );
}

export function AdminAnalytics() {
  const [range, setRange] = useState<AnalyticsRange>("30d");
  const snapshot = analyticsSnapshots[range];
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
          <p>演示快照，查看访问趋势、设备分布与文章表现。</p>
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
          {snapshot.trend[0].date} 至 {snapshot.trend.at(-1)?.date}（北京时间）
        </p>
      </div>
      {analyticsRanges.map((item) => (
        <TabsPanel key={item.value} value={item.value}>
          <AnalyticsContent range={item.value} />
        </TabsPanel>
      ))}
    </Tabs>
  );
}
