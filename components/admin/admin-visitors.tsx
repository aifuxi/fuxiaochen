"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Globe2, Pause, Play, Search, X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, getDataTableSort, useDataTableState } from "@/components/ui/data-table";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import { durationLabel, visitorSortKeys, type VisitorLog } from "@/lib/analytics/schema";
import { postTime } from "@/lib/posts/schema";

import { AnalyticsQueryStatus, useVisitors } from "./analytics-query";
import { CollectionStatus } from "./collection-status";
import { useDebouncedPostQuery } from "./use-posts";
import "./admin-data-workspace.css";
import "./admin-visitors.css";

const columns: ColumnDef<VisitorLog>[] = [
  {
    id: "ip",
    header: "访问者 IP",
    accessorKey: "ip",
    enableSorting: true,
    meta: { className: "visitors-ip", rowHeader: true },
    cell: ({ row }) => {
      const log = row.original;
      return <> {log.ip} </>;
    },
  },
  {
    id: "location",
    header: "地理位置",
    accessorKey: "location",
    enableSorting: true,
    cell: ({ row }) => {
      const log = row.original;
      return (
        <>
          <span className="visitors-location">
            <Globe2 size={14} aria-hidden="true" />
            {log.location}
          </span>
        </>
      );
    },
  },
  {
    id: "entryPage",
    header: "受访入口",
    accessorKey: "entryPage",
    enableSorting: true,
    meta: { className: "visitors-path" },
    cell: ({ row }) => {
      const log = row.original;
      return <> {log.entryPage} </>;
    },
  },
  {
    id: "platform",
    header: "终端与系统",
    accessorFn: (log) => `${log.browser}\0${log.os}`,
    enableSorting: true,
    cell: ({ row }) => {
      const log = row.original;
      return (
        <>
          <div className="visitors-platform">
            <span>{log.browser}</span>
            <small>{log.os}</small>
          </div>
        </>
      );
    },
  },
  {
    id: "duration",
    header: "停留时长",
    accessorKey: "durationMs",
    enableSorting: true,
    cell: ({ row }) => {
      const log = row.original;
      return (
        <>
          <span className="visitors-duration">{durationLabel(log.durationMs)}</span>
        </>
      );
    },
  },
  {
    id: "time",
    header: "访问时间",
    accessorKey: "createdAt",
    enableSorting: true,
    meta: { className: "admin-post-metric" },
    cell: ({ row }) => {
      const log = row.original;
      return (
        <>
          <time dateTime={log.createdAt}>{postTime(log.createdAt)}</time>
        </>
      );
    },
  },
];

export function AdminVisitors() {
  const [paused, setPaused] = useState(false);
  const [query, setQuery] = useState("");
  const tableState = useDataTableState(10);
  const { setPage } = tableState;
  const searchInput = useRef<HTMLInputElement>(null);

  const q = useDebouncedPostQuery(query);
  const result = useVisitors(
    {
      q,
      page: tableState.page,
      pageSize: tableState.pagination.pageSize,
      ...getDataTableSort(tableState.sorting, visitorSortKeys),
    },
    paused,
  );
  const data = result.data;
  const updateQuery = (value: string) => {
    setQuery(value);
    setPage(1);
  };
  const clearSearch = () => {
    updateQuery("");
    searchInput.current?.focus();
  };
  const metrics = [
    {
      label: "当前在线人数",
      value: data?.summary.online,
      tone: "online",
      detail: "最近五分钟活跃访客",
    },
    {
      label: "今日独立访客 (UV)",
      value: data?.summary.uv,
      tone: "coverage",
      detail: "按匿名访客标识去重",
    },
    {
      label: "今日浏览量 (PV)",
      value: data?.summary.pv,
      tone: "views",
      detail: "公开页面浏览次数",
    },
  ];

  return (
    <div className="admin-posts admin-data-page admin-visitors">
      <div className="admin-page-heading">
        <div>
          <h1>访客日志</h1>
          <p>查看访问记录，IP 已脱敏。</p>
        </div>
      </div>

      <AnalyticsQueryStatus
        loading={result.isPending}
        error={result.error}
        hasData={!!data}
        reload={() => void result.refetch()}
      />
      {data && <CollectionStatus collection={data.collection} />}
      <section className="visitors-metrics" aria-label="访客统计">
        {metrics.map(({ label, value, tone, detail }) => (
          <Card className="visitors-metric" key={label}>
            <div>
              <h2>{label}</h2>
              <div className="visitors-value">
                <strong>{value?.toLocaleString("zh-CN") ?? "—"}</strong>
                <span className={tone === "online" ? "visitors-active" : undefined}>{detail}</span>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="admin-data-workspace" aria-label="访客日志工作区">
        <div className="admin-data-toolbar visitors-controls">
          <div className="visitors-stream-status">
            <span
              className={`visitors-status-dot ${paused || result.error ? "is-paused" : ""}`}
              aria-hidden="true"
            />
            <div>
              <strong>
                {result.error ? "查询失败" : paused ? "访问记录更新已暂停" : "访问记录更新中"}
              </strong>
              <p>每 10 秒自动更新</p>
            </div>
          </div>
          <div className="visitors-search-controls">
            <Button
              size="compact"
              onClick={() => {
                setPaused(!paused);
                if (paused) void result.refetch();
              }}
              aria-pressed={paused}
            >
              {paused ? (
                <Play size={14} aria-hidden="true" />
              ) : (
                <Pause size={14} aria-hidden="true" />
              )}
              {paused ? "恢复更新" : "暂停更新"}
            </Button>
            <InputGroup size="compact" className="visitors-search">
              <InputGroupInput
                ref={searchInput}
                aria-label="搜索 IP、城市或受访页面"
                placeholder="搜索 IP、城市或受访页面…"
                value={query}
                onChange={(event) => updateQuery(event.target.value)}
              />
              <InputGroupAddon>
                <Search size={16} aria-hidden="true" />
              </InputGroupAddon>
              {query && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton size="compact" aria-label="清空搜索" onClick={clearSearch}>
                    <X size={16} aria-hidden="true" />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
          </div>
        </div>
        <DataTable
          {...tableState}
          data={data?.items ?? []}
          mode="server"
          rowCount={data?.total ?? 0}
          loading={result.isPending || result.isFetching}
          disabled={!!result.error && !data}
          columns={columns}
          getRowId={(log) => log.id}
          caption="访客日志，访问时间为北京时间，停留时长为可见页面停留"
          tableClassName="admin-post-table visitors-table"
          emptyState={
            <div className="admin-post-empty">
              <Search size={26} aria-hidden="true" />
              <h2>
                {result.error
                  ? "访客日志查询失败"
                  : result.isPending
                    ? "正在加载访客日志…"
                    : q
                      ? "没有匹配的访客日志"
                      : "暂无访问记录"}
              </h2>
              <p>
                {result.error
                  ? "请使用上方重试按钮重新查询。"
                  : result.isPending
                    ? "正在加载访问记录。"
                    : q
                      ? "试试其他脱敏 IP、地域或页面关键词。"
                      : "可在系统设置中启用访问统计。"}
              </p>
              <Button size="compact" onClick={clearSearch}>
                清空搜索
              </Button>
            </div>
          }
        />
      </section>
      <p className="admin-post-session-note">访问明细保留180天；暂停更新不影响前台采集。</p>
    </div>
  );
}
