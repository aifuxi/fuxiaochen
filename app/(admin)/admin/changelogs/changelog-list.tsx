"use client";

import { useRouter, useSearchParams } from "next/navigation";
import NiceModal from "@ebay/nice-modal-react";
import { Edit, Loader2, Plus, Search, Trash2 } from "lucide-react";
import useSWR from "swr";
import type { ColumnDef } from "@tanstack/react-table";
import { getChangelogsAction } from "@/app/actions/changelog";
import { type Changelog, type ChangelogListReq } from "@/types/changelog";
import { Button } from "@/components/ui/button";
import { AppleCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { formatSimpleDate, formatSimpleDateWithTime } from "@/lib/time";
import { ChangelogDialog } from "./changelog-dialog";
import { DeleteAlert } from "./delete-alert";

const fetcher = async (params: ChangelogListReq) => {
  const res = await getChangelogsAction(params);
  if (res.success) {
    return res.data;
  }
  throw new Error(res.error);
};

export default function ChangelogManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const version = searchParams.get("version") || undefined;

  const { data, error, isLoading, mutate } = useSWR(
    { page, pageSize, version },
    fetcher,
  );

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  const getPageUrl = (pageNum: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNum.toString());
    return `?${params.toString()}`;
  };

  const getVisiblePages = () => {
    const pages: (number | "ellipsis")[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("query") as string;

    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set("version", query);
    } else {
      params.delete("version");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleEdit = (changelog: Changelog) => {
    NiceModal.show(ChangelogDialog, {
      changelog,
      onSuccess: () => mutate(),
    });
  };

  const handleDelete = (changelog: Changelog) => {
    NiceModal.show(DeleteAlert, {
      id: changelog.id,
      onSuccess: () => mutate(),
    });
  };

  const handleCreate = () => {
    NiceModal.show(ChangelogDialog, {
      onSuccess: () => mutate(),
    });
  };

  const columns: ColumnDef<Changelog>[] = [
    {
      accessorKey: "version",
      header: "版本",
      cell: ({ row }) => (
        <span className="font-medium text-text">{row.original.version}</span>
      ),
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="发布日期" />
      ),
      cell: ({ row }) => (
        <span className="text-text-secondary">
          {row.original.date
            ? formatSimpleDate(new Date(row.original.date))
            : "-"}
        </span>
      ),
    },
    {
      accessorKey: "content",
      header: "内容预览",
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-sm whitespace-normal text-text-secondary">
          {row.original.content}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="创建时间" />
      ),
      cell: ({ row }) => formatSimpleDateWithTime(new Date(row.original.createdAt)),
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="更新时间" />
      ),
      cell: ({ row }) => formatSimpleDateWithTime(new Date(row.original.updatedAt)),
    },
    {
      id: "actions",
      enablePinning: true,
      header: "操作",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row.original)}
            className="hover:bg-error/10 hover:text-error"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text">
          更新日志管理
        </h1>
        <p className="mt-1 text-text-secondary">管理系统更新日志</p>
      </div>

      <AppleCard
        className={`
          flex flex-col gap-4 p-4
          sm:flex-row sm:items-center sm:justify-between
        `}
      >
        <form
          onSubmit={handleSearch}
          className="flex flex-1 items-center gap-2"
        >
          <div className="relative max-w-sm flex-1">
            <Search className="absolute top-3 left-3 z-10 h-4 w-4 text-text-secondary" />
            <Input
              name="query"
              placeholder="搜索版本号..."
              defaultValue={version || ""}
              className="pl-9"
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            className={`
              border border-border bg-surface text-text
              hover:bg-accent/5 hover:text-accent
            `}
          >
            搜索
          </Button>
        </form>
        <Button
          onClick={handleCreate}
          className={`
            hover:bg-accent-hover
            bg-accent text-white
          `}
        >
          <Plus className="mr-2 h-4 w-4" />
          新建日志
        </Button>
      </AppleCard>

      <AppleCard className="overflow-hidden p-0">
        {isLoading ? (
          <div className="flex h-24 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-text-secondary" />
          </div>
        ) : error ? (
          <div className="flex h-24 items-center justify-center text-error">
            加载失败: {error.message}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data?.lists || []}
            showPagination={false}
            emptyText="暂无数据"
          />
        )}
      </AppleCard>

      {data && data.total > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">共 {data.total} 条</span>
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                {page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious href={getPageUrl(page - 1)} />
                  </PaginationItem>
                )}

                {getVisiblePages().map((p, index) => (
                  <PaginationItem key={index}>
                    {p === "ellipsis" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink href={getPageUrl(p)} isActive={p === page}>
                        {p}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                {page < totalPages && (
                  <PaginationItem>
                    <PaginationNext href={getPageUrl(page + 1)} />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}
