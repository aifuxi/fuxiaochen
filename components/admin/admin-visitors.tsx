"use client";

import { ChevronLeft, ChevronRight, Globe2, Pause, Play, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";

import { initialVisitorLogs, visitorStreamSamples, visitorSummary } from "./visitors-mock-data";
import "./admin-data-workspace.css";
import "./admin-visitors.css";

const pageSize = 10;
const onlineCounts = [14, 15, 13, 16, 14, 12, 15, 17];

export function AdminVisitors() {
  const [logs, setLogs] = useState(initialVisitorLogs);
  const [online, setOnline] = useState(visitorSummary.online);
  const [paused, setPaused] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const heartbeat = useRef(0);
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (paused) return undefined;
    const interval = window.setInterval(() => {
      const beat = ++heartbeat.current;
      setOnline(onlineCounts[beat % onlineCounts.length]);
      if (beat % 3 !== 0) return;
      const sample = visitorStreamSamples[(beat / 3 - 1) % visitorStreamSamples.length];
      const entry = {
        ...sample,
        id: `live-visitor-${beat}`,
        duration: "00:01",
        time: new Date().toLocaleTimeString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false }),
      };
      setLogs((current) => [entry, ...current].slice(0, 16));
    }, 4500);
    return () => window.clearInterval(interval);
  }, [paused]);

  const term = query.trim().toLocaleLowerCase();
  const filtered = logs.filter((log) =>
    [log.ip, log.location, log.entryPage].some((value) => value.toLocaleLowerCase().includes(term)),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const visibleLogs = filtered.slice(start, start + pageSize);
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
      label: "当前实时在线",
      value: online,
      tone: "online",
      detail: paused ? "更新已暂停" : "实时活跃（模拟）",
    },
    {
      label: "今日独立 IP 覆盖",
      value: visitorSummary.uniqueIps,
      tone: "coverage",
      detail: `涵盖 ${visitorSummary.cities} 个城市`,
    },
    {
      label: "合规搜索引擎蜘蛛",
      value: visitorSummary.crawlers,
      tone: "crawler",
      detail: "Google / Baidu Bot",
    },
  ];

  return (
    <div className="admin-posts admin-data-page admin-visitors">
      <div className="admin-page-heading">
        <div>
          <h1>访客日志</h1>
          <p>演示数据，模拟访问记录与在线人数；未接入真实访问采集。</p>
        </div>
      </div>

      <section className="visitors-metrics" aria-label="模拟访客统计">
        {metrics.map(({ label, value, tone, detail }) => (
          <Card className="visitors-metric" key={label}>
            <div>
              <h2>{label}</h2>
              <div className="visitors-value">
                <strong>{value.toLocaleString("zh-CN")}</strong>
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
              className={`visitors-status-dot ${paused ? "is-paused" : ""}`}
              aria-hidden="true"
            />
            <div>
              <strong>{paused ? "模拟访问流已暂停" : "模拟访问流更新中"}</strong>
              <p>每 4.5 秒更新，最多保留 16 条日志</p>
            </div>
          </div>
          <div className="visitors-search-controls">
            <Button
              size="compact"
              onClick={() => setPaused((value) => !value)}
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
        <section
          className="admin-post-table-scroll"
          aria-label="访客日志表格，可横向滚动"
          // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- 允许键盘用户滚动宽表格。
          tabIndex={0}
        >
          <table className="admin-post-table visitors-table">
            <caption className="sr-only">
              模拟访客日志，访问时间为北京时间，停留时长格式为分:秒
            </caption>
            <colgroup>
              {Array.from({ length: 6 }, (_, index) => (
                <col key={index} />
              ))}
            </colgroup>
            <thead>
              <tr>
                {["访问者 IP", "地理位置", "受访入口", "终端与系统", "停留时长", "访问时间"].map(
                  (label) => (
                    <th scope="col" key={label}>
                      {label}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {visibleLogs.map((log) => (
                <tr key={log.id}>
                  <th scope="row" className="visitors-ip">
                    {log.ip}
                  </th>
                  <td>
                    <span className="visitors-location">
                      <Globe2 size={14} aria-hidden="true" />
                      {log.location}
                    </span>
                  </td>
                  <td className="visitors-path">{log.entryPage}</td>
                  <td aria-label={`${log.browser}，${log.os}`}>
                    <div className="visitors-platform">
                      <span>{log.browser}</span>
                      <small>{log.os}</small>
                    </div>
                  </td>
                  <td>
                    <span className="visitors-duration">{log.duration}</span>
                  </td>
                  <td className="admin-post-metric">
                    <time>{log.time}</time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        {!filtered.length && (
          <div className="admin-post-empty">
            <Search size={26} aria-hidden="true" />
            <h2>没有匹配的访客日志</h2>
            <p>试试其他 IP、城市或页面关键词。</p>
            <Button size="compact" onClick={clearSearch}>
              清空搜索
            </Button>
          </div>
        )}
        <div className="admin-post-pagination">
          <span>
            显示第 {filtered.length ? start + 1 : 0}–{Math.min(start + pageSize, filtered.length)}{" "}
            条，共 {filtered.length} 条
          </span>
          <nav aria-label="访客日志分页">
            <Button
              variant="ghost"
              size="compact"
              aria-label="上一页"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </Button>
            <span aria-current="page">
              {currentPage} / {pageCount}
            </span>
            <Button
              variant="ghost"
              size="compact"
              aria-label="下一页"
              disabled={currentPage === pageCount}
              onClick={() => setPage(currentPage + 1)}
            >
              <ChevronRight size={16} aria-hidden="true" />
            </Button>
          </nav>
        </div>
      </section>
      <p className="admin-post-session-note">离开页面后停止模拟更新，再次进入恢复初始数据。</p>
    </div>
  );
}
