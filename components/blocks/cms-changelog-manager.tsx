"use client";

import React from "react";
import Link from "next/link";
import NiceModal from "@ebay/nice-modal-react";
import { format } from "date-fns";
import { History, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/ui/table";
import { ChangelogDeleteDialog } from "@/components/modals/changelog-delete-dialog";
import { ChangelogItemType } from "@/generated/prisma/enums";
import {
  deleteChangelogRelease,
  listChangelogReleases,
  type ChangelogApiError,
  type ListChangelogReleasesResult,
} from "@/lib/changelog/changelog-client";
import type { ChangelogReleaseDto } from "@/lib/changelog/changelog-dto";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_DELAY = 300;
const MAJOR_OPTIONS = [
  { label: "全部版本", value: "" },
  { label: "大版本", value: "true" },
  { label: "小版本", value: "false" },
];

export function CmsChangelogManager() {
  const [page, setPage] = React.useState(1);
  const [searchValue, setSearchValue] = React.useState("");
  const [keyword, setKeyword] = React.useState("");
  const [isMajorFilter, setIsMajorFilter] = React.useState<
    "" | "false" | "true"
  >("");

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setKeyword(searchValue.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_DELAY);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchValue]);

  const query = React.useMemo(
    () => ({
      isMajor: isMajorFilter === "" ? undefined : isMajorFilter === "true",
      keyword: keyword || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [isMajorFilter, keyword, page],
  );

  const { data, error, isLoading, isValidating, mutate } = useSWR<
    ListChangelogReleasesResult,
    ChangelogApiError
  >(
    [
      "changelog-releases",
      query.keyword ?? "",
      String(query.isMajor ?? ""),
      query.page,
      query.pageSize,
    ],
    () => listChangelogReleases(query),
    {
      keepPreviousData: true,
    },
  );

  const deleteMutation = useSWRMutation(
    "delete-changelog-release",
    (_key, { arg }: { arg: { id: string } }) => deleteChangelogRelease(arg.id),
  );

  const releases = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(data?.totalPages ?? 1, 1);
  const visiblePages = getVisiblePages(page, totalPages);

  React.useEffect(() => {
    if (!data) {
      return;
    }

    if (page > data.totalPages && data.totalPages > 0) {
      setPage(data.totalPages);
    }
  }, [data, page]);

  async function handleDelete(release: ChangelogReleaseDto) {
    await deleteMutation.trigger({
      id: release.id,
    });
    toast.success(`已删除 ${release.version}。`);

    const nextTotal = Math.max(total - 1, 0);
    const nextTotalPages = Math.max(Math.ceil(nextTotal / PAGE_SIZE), 1);

    if (page > nextTotalPages) {
      setPage(nextTotalPages);

      return;
    }

    await mutate();
  }

  function openDeleteDialog(release: ChangelogReleaseDto) {
    void NiceModal.show(ChangelogDeleteDialog, {
      onConfirm: () => handleDelete(release),
      release,
    });
  }

  return (
    <div className="space-y-6">
      <div
        className={`
          flex flex-col gap-4
          lg:flex-row lg:items-center lg:justify-between
        `}
      >
        <div
          className={`
            flex flex-1 flex-col gap-3
            lg:flex-row lg:items-center
          `}
        >
          <div className="w-full max-w-md">
            <Input
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="按版本、标题或摘要搜索"
              startAdornment={<Search className="size-4" />}
              value={searchValue}
            />
          </div>
          <div className="w-full max-w-56">
            <Select
              onValueChange={(value) => {
                setIsMajorFilter(value as "" | "false" | "true");
                setPage(1);
              }}
              options={MAJOR_OPTIONS}
              value={isMajorFilter}
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-muted">
            <Badge variant="muted">{total} 个版本</Badge>
            {isValidating && !isLoading ? (
              <span className="inline-flex items-center gap-2">
                <RefreshCw className={`size-3 animate-spin`} /> 刷新中
              </span>
            ) : null}
          </div>
        </div>

        <Link href="/cms/changelog/new">
          <Button variant="primary" className="font-medium!">
            <Plus className="size-4" />
            新建版本
          </Button>
        </Link>
      </div>

      <div
        className={`
          grid gap-4
          sm:grid-cols-3
        `}
      >
        <MetricCard label="版本总数" value={String(total)} />
        <MetricCard label="可见版本" value={String(releases.length)} />
        <MetricCard
          label="当前筛选"
          value={
            isMajorFilter === ""
              ? "全部版本"
              : isMajorFilter === "true"
                ? "大版本"
                : "小版本"
          }
        />
      </div>

      <Table>
        <TableRoot>
          <TableHead>
            <tr>
              <TableHeaderCell>版本</TableHeaderCell>
              <TableHeaderCell>日期</TableHeaderCell>
              <TableHeaderCell>项数</TableHeaderCell>
              <TableHeaderCell>亮点</TableHeaderCell>
              <TableHeaderCell>状态</TableHeaderCell>
              <TableHeaderCell className="text-right">操作</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }, (_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={6}>
                    <div className="h-14 animate-pulse rounded-xl bg-white/5" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell className="py-10" colSpan={6}>
                  <div className="flex flex-col items-center gap-4 text-center">
                    <p className="max-w-md text-sm text-muted">
                      {error.message || "加载更新日志失败。"}
                    </p>
                    <Button onClick={() => void mutate()} variant="outline">
                      重试
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : releases.length === 0 ? (
              <TableRow>
                <TableCell className="py-12" colSpan={6}>
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div
                      className={`
                        flex size-12 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-muted
                      `}
                    >
                      <History className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base text-foreground">
                        {keyword || isMajorFilter
                          ? "没有符合筛选条件的更新日志。"
                          : "暂无更新日志。"}
                      </p>
                      <p className="text-sm text-muted">
                        {keyword || isMajorFilter
                          ? "尝试不同的筛选组合。"
                          : "创建第一个版本以开始追踪产品更新。"}
                      </p>
                    </div>
                    {!keyword && !isMajorFilter ? (
                      <Link href="/cms/changelog/new">
                        <Button variant="outline">
                          <Plus className="size-4" />
                          创建版本
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              releases.map((release) => (
                <TableRow key={release.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">
                        {release.version}
                      </div>
                      <div className="text-xs text-muted">{release.title}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted">
                    {format(new Date(release.releasedOn), "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell>{release.items.length}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {summarizeItemTypes(release.items).map((item) => (
                        <Badge key={item.label} variant={item.variant}>
                          {item.label} {item.count}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={release.isMajor ? "success" : "muted"}>
                      {release.isMajor ? "大版本" : "小版本"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Link href={`/cms/changelog/${release.id}`}>
                        <Button size="sm" variant="ghost">
                          编辑
                        </Button>
                      </Link>
                      <Button
                        disabled={deleteMutation.isMutating}
                        onClick={() => openDeleteDialog(release)}
                        size="sm"
                        variant="outline"
                      >
                        <Trash2 className="size-4" />
                        删除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </TableRoot>
      </Table>

      <div
        className={`
          flex flex-col gap-4
          sm:flex-row sm:items-center sm:justify-between
        `}
      >
        <p className="text-sm text-muted">
          {total === 0
            ? "无记录"
            : `显示 ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)}，共 ${total} 条`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            disabled={page === 1 || isLoading}
            onClick={() =>
              setPage((currentPage) => Math.max(currentPage - 1, 1))
            }
            size="sm"
            variant="outline"
          >
            上一页
          </Button>
          {visiblePages.map((item) => (
            <Button
              key={item}
              disabled={isLoading}
              onClick={() => setPage(item)}
              size="sm"
              variant={item === page ? "primary" : "ghost"}
            >
              {item}
            </Button>
          ))}
          <Button
            disabled={page === totalPages || isLoading}
            onClick={() =>
              setPage((currentPage) => Math.min(currentPage + 1, totalPages))
            }
            size="sm"
            variant="outline"
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
      <p className="text-xs tracking-[0.18em] text-muted uppercase">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function getItemTypeVariant(itemType: ChangelogItemType) {
  if (itemType === ChangelogItemType.Added) {
    return "success";
  }

  if (itemType === ChangelogItemType.Fixed) {
    return "warning";
  }

  if (itemType === ChangelogItemType.Removed) {
    return "destructive";
  }

  if (itemType === ChangelogItemType.Improved) {
    return "info";
  }

  return "muted";
}

function getVisiblePages(page: number, totalPages: number) {
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const startPage = Math.max(
    1,
    Math.min(page - 2, totalPages - maxVisiblePages + 1),
  );

  return Array.from(
    { length: maxVisiblePages },
    (_, index) => startPage + index,
  );
}

function summarizeItemTypes(items: ChangelogReleaseDto["items"]) {
  const counts = new Map<ChangelogItemType, number>();

  for (const item of items) {
    counts.set(item.itemType, (counts.get(item.itemType) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([itemType, count]) => ({
    count,
    label: itemType,
    variant: getItemTypeVariant(itemType) as
      | "destructive"
      | "info"
      | "muted"
      | "success"
      | "warning",
  }));
}
