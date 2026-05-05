"use client";

import { useMemo, useState } from "react";

import { Clock3, DatabaseZap, Eye, FilterX, Gauge, Search } from "lucide-react";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { apiRequest, buildApiUrl } from "@/lib/api/fetcher";
import type { AdminApiTimingLogListItem } from "@/lib/server/api-logs/mappers";

type LogsListPayload = {
  items: AdminApiTimingLogListItem[];
};

type LogsListMeta = {
  page: number;
  pageSize: number;
  total: number;
};

type LogFilters = {
  errorCode: string;
  event: string;
  from: string;
  method: string;
  minTotalMs: string;
  operation: string;
  path: string;
  requestId: string;
  scope: string;
  status: string;
  statusClass: string;
  to: string;
  userId: string;
};

const PAGE_SIZE = 20;

const EMPTY_FILTERS: LogFilters = {
  errorCode: "",
  event: "all",
  from: "",
  method: "all",
  minTotalMs: "",
  operation: "",
  path: "",
  requestId: "",
  scope: "all",
  status: "",
  statusClass: "all",
  to: "",
  userId: "",
};

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  dateStyle: "medium",
  timeStyle: "medium",
});

const scopeLabelMap: Record<AdminApiTimingLogListItem["scope"], string> = {
  admin: "后台",
  auth: "认证",
  other: "其他",
  public: "公开",
};

const eventLabelMap: Record<AdminApiTimingLogListItem["event"], string> = {
  api_proxy_timing: "Proxy",
  api_timing: "Handler",
};

function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

function formatMs(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${value} ms`;
}

function toApiDateTime(value: string) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function getStatusBadge(status: number) {
  if (status >= 500) {
    return <Badge variant="destructive">{status}</Badge>;
  }

  if (status >= 400) {
    return (
      <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20">
        {status}
      </Badge>
    );
  }

  if (status >= 300) {
    return <Badge variant="outline">{status}</Badge>;
  }

  return (
    <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">
      {status}
    </Badge>
  );
}

function getScopeBadge(scope: AdminApiTimingLogListItem["scope"]) {
  const classNameMap: Record<AdminApiTimingLogListItem["scope"], string> = {
    admin: "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20",
    auth: "bg-violet-500/10 text-violet-700 hover:bg-violet-500/20",
    other: "bg-slate-500/10 text-slate-700 hover:bg-slate-500/20",
    public: "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20",
  };

  return <Badge className={classNameMap[scope]}>{scopeLabelMap[scope]}</Badge>;
}

export function AdminApiLogsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<LogFilters>(EMPTY_FILTERS);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const logsUrl = useMemo(
    () =>
      buildApiUrl("/api/admin/logs", {
        errorCode: filters.errorCode || undefined,
        event: filters.event === "all" ? undefined : filters.event,
        from: toApiDateTime(filters.from),
        method: filters.method === "all" ? undefined : filters.method,
        minTotalMs: filters.minTotalMs || undefined,
        operation: filters.operation || undefined,
        page,
        pageSize: PAGE_SIZE,
        path: filters.path || undefined,
        requestId: filters.requestId || undefined,
        scope: filters.scope === "all" ? undefined : filters.scope,
        status: filters.status || undefined,
        statusClass:
          filters.statusClass === "all" ? undefined : filters.statusClass,
        to: toApiDateTime(filters.to),
        userId: filters.userId || undefined,
      }),
    [filters, page],
  );

  const { data, error, isLoading } = useSWR<{
    data: LogsListPayload;
    meta: LogsListMeta;
  }>(
    logsUrl,
    (url: string) =>
      apiRequest<LogsListPayload, LogsListMeta>(url) as Promise<{
        data: LogsListPayload;
        meta: LogsListMeta;
      }>,
    {
      revalidateOnFocus: false,
    },
  );

  const logs = data?.data.items ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = total === 0 ? 0 : Math.min(page * PAGE_SIZE, total);
  const selectedLog = logs.find((log) => log.id === selectedLogId) ?? null;

  const updateFilter = (key: keyof LogFilters, value: string) => {
    setPage(1);
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setPage(1);
    setFilters(EMPTY_FILTERS);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">日志记录</h1>
          <p className="text-muted-foreground">
            查询慢请求、错误请求和代理鉴权耗时，用于定位接口性能问题。
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-muted-foreground">
          <DatabaseZap className="size-4" />
          仅展示已入库的慢请求与错误请求
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>接口日志</CardTitle>
          <CardDescription>
            可按 requestId、路径、状态码、耗时和时间范围筛选。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid gap-3 lg:grid-cols-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                disabled={isLoading}
                placeholder="按路径模糊查询，例如 /api/public/settings"
                value={filters.path}
                onChange={(event) => updateFilter("path", event.target.value)}
              />
            </div>
            <Input
              disabled={isLoading}
              placeholder="requestId"
              value={filters.requestId}
              onChange={(event) =>
                updateFilter("requestId", event.target.value)
              }
            />
            <Input
              disabled={isLoading}
              placeholder="operation"
              value={filters.operation}
              onChange={(event) =>
                updateFilter("operation", event.target.value)
              }
            />
            <Select
              value={filters.scope}
              onValueChange={(value) => updateFilter("scope", value)}
            >
              <SelectTrigger disabled={isLoading}>
                <SelectValue placeholder="范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部范围</SelectItem>
                <SelectItem value="admin">后台</SelectItem>
                <SelectItem value="public">公开</SelectItem>
                <SelectItem value="auth">认证</SelectItem>
                <SelectItem value="other">其他</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.event}
              onValueChange={(value) => updateFilter("event", value)}
            >
              <SelectTrigger disabled={isLoading}>
                <SelectValue placeholder="日志类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="api_timing">Handler</SelectItem>
                <SelectItem value="api_proxy_timing">Proxy</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.method}
              onValueChange={(value) => updateFilter("method", value)}
            >
              <SelectTrigger disabled={isLoading}>
                <SelectValue placeholder="方法" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部方法</SelectItem>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.statusClass}
              onValueChange={(value) => updateFilter("statusClass", value)}
            >
              <SelectTrigger disabled={isLoading}>
                <SelectValue placeholder="状态分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="2xx">2xx</SelectItem>
                <SelectItem value="3xx">3xx</SelectItem>
                <SelectItem value="4xx">4xx</SelectItem>
                <SelectItem value="5xx">5xx</SelectItem>
              </SelectContent>
            </Select>
            <Input
              disabled={isLoading}
              inputMode="numeric"
              placeholder="精确状态码"
              value={filters.status}
              onChange={(event) => updateFilter("status", event.target.value)}
            />
            <Input
              disabled={isLoading}
              inputMode="numeric"
              placeholder="最小总耗时 ms"
              value={filters.minTotalMs}
              onChange={(event) =>
                updateFilter("minTotalMs", event.target.value)
              }
            />
            <Input
              disabled={isLoading}
              placeholder="错误码"
              value={filters.errorCode}
              onChange={(event) =>
                updateFilter("errorCode", event.target.value)
              }
            />
            <Input
              disabled={isLoading}
              placeholder="userId"
              value={filters.userId}
              onChange={(event) => updateFilter("userId", event.target.value)}
            />
            <Input
              disabled={isLoading}
              type="datetime-local"
              value={filters.from}
              onChange={(event) => updateFilter("from", event.target.value)}
            />
            <Input
              disabled={isLoading}
              type="datetime-local"
              value={filters.to}
              onChange={(event) => updateFilter("to", event.target.value)}
            />
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={resetFilters}
            >
              <FilterX className="mr-2 size-4" />
              重置筛选
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>时间</TableHead>
                  <TableHead>范围</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>方法</TableHead>
                  <TableHead>路径</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>总耗时</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>错误码</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-12 text-center">
                      <div className="inline-flex items-center gap-2 text-muted-foreground">
                        <Spinner />
                        正在加载日志...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}
                {!isLoading && error ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="py-12 text-center text-destructive"
                    >
                      {error.message}
                    </TableCell>
                  </TableRow>
                ) : null}
                {!isLoading && !error && logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-12 text-center">
                      <div className="space-y-1 text-muted-foreground">
                        <p className="font-medium">未找到日志</p>
                        <p className="text-sm">
                          请调整筛选条件，或确认已开启 API_TIMING_DB_LOGS。
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}
                {!isLoading && !error
                  ? logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatDateTime(log.createdAt)}
                        </TableCell>
                        <TableCell>{getScopeBadge(log.scope)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {eventLabelMap[log.event]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{log.method}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[360px]">
                          <div className="truncate font-mono text-xs">
                            {log.path}
                          </div>
                          {log.operation ? (
                            <div className="mt-1 truncate text-xs text-muted-foreground">
                              {log.operation}
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell className="font-medium">
                          {formatMs(log.totalMs)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatMs(log.serviceMs)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {log.errorCode ?? "-"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedLogId(log.id)}
                          >
                            <Eye className="size-4" />
                            <span className="sr-only">查看详情</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  : null}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              显示 {from}-{to} / {total} 条日志
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading || page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                上一页
              </Button>
              <span className="text-sm text-muted-foreground">
                第 {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading || page >= totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Sheet
        open={selectedLog !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedLogId(null);
          }
        }}
      >
        <SheetContent className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>日志详情</SheetTitle>
            <SheetDescription>
              查看分段耗时、状态和关联 requestId。
            </SheetDescription>
          </SheetHeader>

          {selectedLog ? (
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <div className="space-y-6">
                <div className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {getScopeBadge(selectedLog.scope)}
                    <Badge variant="outline">
                      {eventLabelMap[selectedLog.event]}
                    </Badge>
                    <Badge variant="secondary">{selectedLog.method}</Badge>
                    {getStatusBadge(selectedLog.status)}
                  </div>
                  <p className="mt-4 font-mono text-sm break-all">
                    {selectedLog.path}
                  </p>
                  {selectedLog.operation ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {selectedLog.operation}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock3 className="size-4" />
                      记录时间
                    </div>
                    <p className="mt-2 font-medium">
                      {formatDateTime(selectedLog.createdAt)}
                    </p>
                  </div>
                  <div className="rounded-xl border p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Gauge className="size-4" />
                      总耗时
                    </div>
                    <p className="mt-2 font-medium">
                      {formatMs(selectedLog.totalMs)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailItem
                    label="authMs"
                    value={formatMs(selectedLog.authMs)}
                  />
                  <DetailItem
                    label="parseMs"
                    value={formatMs(selectedLog.parseMs)}
                  />
                  <DetailItem
                    label="serviceMs"
                    value={formatMs(selectedLog.serviceMs)}
                  />
                  <DetailItem
                    label="responseMs"
                    value={formatMs(selectedLog.responseMs)}
                  />
                  <DetailItem
                    label="proxyAuthMs"
                    value={formatMs(selectedLog.proxyAuthMs)}
                  />
                  <DetailItem
                    label="errorCode"
                    value={selectedLog.errorCode ?? "-"}
                  />
                  <DetailItem
                    label="userId"
                    value={selectedLog.userId ?? "-"}
                  />
                  <DetailItem label="role" value={selectedLog.role ?? "-"} />
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">requestId</p>
                  <p className="mt-2 font-mono text-sm break-all">
                    {selectedLog.requestId}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium break-all">{value}</p>
    </div>
  );
}
