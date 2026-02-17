"use client";

import { useRouter, useSearchParams } from "next/navigation";
import NiceModal from "@ebay/nice-modal-react";
import { Edit, Loader2, Plus, Search, Trash2 } from "lucide-react";
import useSWR from "swr";
import type { ColumnDef } from "@tanstack/react-table";
import { getCategoriesAction } from "@/app/actions/category";
import { type Category, type CategoryListReq } from "@/types/category";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppleCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { formatSimpleDateWithTime } from "@/lib/time";
import { CategoryDialog } from "./category-dialog";
import { DeleteAlert } from "./delete-alert";

const fetcher = async (params: CategoryListReq) => {
  const res = await getCategoriesAction(params);
  if (!res.success) throw new Error(res.error);
  return res.data;
};

export default function CategoryManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const name = searchParams.get("name") || undefined;

  const { data, isLoading, mutate } = useSWR(
    { page, pageSize, name },
    fetcher,
  );

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

  const openDelete = (id: string) => {
    NiceModal.show(DeleteAlert, {
      id,
      onSuccess: () => mutate(),
    });
  };

  const showCategoryModal = (category?: Category) => {
    NiceModal.show(CategoryDialog, {
      category,
      onSuccess: () => mutate(),
    });
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "name",
      header: "名称",
      cell: ({ row }) => (
        <span className="font-medium text-text">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <Badge variant="outline" className="border-accent text-accent">
          {row.original.slug}
        </Badge>
      ),
    },
    {
      accessorKey: "blogCount",
      header: "文章数",
      cell: ({ row }) => row.original.blogCount,
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
            onClick={() => showCategoryModal(row.original)}
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
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-text">
          分类管理
        </h2>
        <p className="text-text-secondary">管理博客文章的分类体系</p>
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
              placeholder="搜索分类..."
              defaultValue={name || ""}
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
          onClick={() => showCategoryModal()}
          className={`
            bg-accent text-white
            hover:bg-accent/90
          `}
        >
          <Plus className="mr-2 h-4 w-4" />
          新增分类
        </Button>
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
            emptyText="暂无分类"
          />
        )}
      </AppleCard>

      {data && (
        <div className="flex justify-center text-sm text-text-secondary">
          共 {data.total} 条数据
        </div>
      )}
    </div>
  );
}
