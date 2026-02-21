"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import NiceModal from "@ebay/nice-modal-react";
import { Edit, Loader2, Plus, Search, Trash2 } from "lucide-react";
import useSWR from "swr";
import type { ColumnDef } from "@tanstack/react-table";
import { getBlogsAction } from "@/app/actions/blog";
import { type Blog, type BlogListReq } from "@/types/blog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { AppleCard } from "@/components/ui/glass-card";

const fetcher = async (params: BlogListReq) => {
  const res = await getBlogsAction(params);
  if (!res.success) throw new Error(res.error);
  return res.data;
};

export default function BlogManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const title = searchParams.get("title") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;

  const { data, isLoading, mutate } = useSWR(
    { page, pageSize, title, categoryId },
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
    const catId = formData.get("categoryId") as string;

    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set("title", query);
    } else {
      params.delete("title");
    }
    if (catId && catId !== "all") {
      params.set("categoryId", catId);
    } else {
      params.delete("categoryId");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const openDelete = (id: string) => {
    NiceModal.show(DeleteAlert, {
      id,
      onSuccess: () => mutate(),
    });
  };

  const columns: ColumnDef<Blog>[] = [
    {
      accessorKey: "cover",
      header: "封面",
      cell: ({ row }) =>
        row.original.cover ? (
          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg">
            <Image
              src={row.original.cover}
              alt={row.original.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-surface-hover text-text-tertiary">
            暂无
          </div>
        ),
    },
    {
      accessorKey: "title",
      header: "标题",
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-[200px] font-medium whitespace-normal text-text">
          {row.original.title}
        </span>
      ),
    },
    {
      accessorKey: "category",
      header: "分类",
      cell: ({ row }) =>
        row.original.category ? (
          <Badge variant="outline" className="border-accent text-accent">
            {row.original.category.name}
          </Badge>
        ) : (
          "-"
        ),
    },
    {
      accessorKey: "tags",
      header: "标签",
      cell: ({ row }) =>
        row.original.tags && row.original.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {row.original.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="bg-accent/10 text-xs text-accent"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        ) : (
          "-"
        ),
    },
    {
      accessorKey: "published",
      header: "发布状态",
      cell: ({ row }) => (
        <Badge
          variant={row.original.published ? "default" : "secondary"}
          className={
            row.original.published
              ? `
                bg-accent/20 text-accent
                hover:bg-accent/30
              `
              : "bg-surface text-text-secondary"
          }
        >
          {row.original.published ? "已发布" : "草稿"}
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
            onClick={() => router.push(`/admin/blogs/${row.original.id}`)}
            className="hover:bg-accent/10 hover:text-accent"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openDelete(row.original.id)}
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-text">
          博客管理
        </h1>
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
              placeholder="搜索文章标题..."
              defaultValue={title || ""}
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
        <Link href="/admin/blogs/new">
          <Button
            className={`
              hover:bg-accent-hover
              bg-accent text-white
            `}
          >
            <Plus className="mr-2 h-4 w-4" /> 新建文章
          </Button>
        </Link>
      </AppleCard>

      <AppleCard className="overflow-hidden p-0">
        {isLoading ? (
          <div className="flex h-24 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-text-secondary" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data?.lists || []}
            showPagination={false}
            emptyText="暂无文章"
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
