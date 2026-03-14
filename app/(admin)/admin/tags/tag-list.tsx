"use client";

import { useRouter, useSearchParams } from "next/navigation";
import NiceModal from "@ebay/nice-modal-react";
import { Edit, Loader2, Plus, Search, Trash2 } from "lucide-react";
import useSWR from "swr";
import type { ColumnDef } from "@tanstack/react-table";
import { getTagsAction } from "@/app/actions/tag";
import { type Tag, type TagListReq } from "@/types/tag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
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
import { formatSimpleDateWithTime } from "@/lib/time";
import { DeleteAlert } from "./delete-alert";
import { TagDialog } from "./tag-dialog";

const fetcher = async (params: TagListReq) => {
  const res = await getTagsAction(params);
  if (!res.success) throw new Error(res.error);
  return res.data;
};

export default function TagManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const name = searchParams.get("name") || undefined;

  const { data, isLoading, mutate } = useSWR(
    { page, pageSize, name },
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
      params.set("name", query);
    } else {
      params.delete("name");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const openEdit = (tag: Tag) => {
    NiceModal.show(TagDialog, {
      tag,
      onSuccess: () => mutate(),
    });
  };

  const openDelete = (id: string) => {
    NiceModal.show(DeleteAlert, {
      id,
      onSuccess: () => mutate(),
    });
  };

  const openCreate = () => {
    NiceModal.show(TagDialog, {
      onSuccess: () => mutate(),
    });
  };

  const columns: ColumnDef<Tag>[] = [
    {
      accessorKey: "name",
      header: "名称",
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-[200px] font-medium whitespace-normal text-foreground">
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.slug}
        </span>
      ),
    },
    {
      accessorKey: "blogCount",
      header: "文章数",
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {row.original.blogCount}
        </Badge>
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
            onClick={() => openEdit(row.original)}
            className="hover:bg-primary/10 hover:text-primary"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openDelete(row.original.id)}
            className="hover:bg-destructive/10 hover:text-destructive"
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          标签管理
        </h1>
        <p className="mt-1 text-muted-foreground">管理博客文章的标签体系</p>
      </div>

      <GlassCard
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
            <Search className="absolute top-3 left-3 z-10 h-4 w-4 text-muted-foreground" />
            <Input
              name="query"
              placeholder="搜索标签名称..."
              defaultValue={name || ""}
              className="pl-9"
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            className={`
              border border-border bg-muted text-foreground
              hover:bg-primary/5 hover:text-primary
            `}
          >
            搜索
          </Button>
        </form>
        <Button
          onClick={openCreate}
          className={`
            bg-primary text-primary-foreground
            hover:bg-primary/90
          `}
        >
          <Plus className="mr-2 h-4 w-4" /> 新建标签
        </Button>
      </GlassCard>

      <GlassCard className="overflow-hidden p-0">
        {isLoading ? (
          <div className="flex h-24 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data?.lists || []}
            showPagination={false}
            emptyText="暂无标签"
          />
        )}
      </GlassCard>

      {data && data.total > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">共 {data.total} 条</span>
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
