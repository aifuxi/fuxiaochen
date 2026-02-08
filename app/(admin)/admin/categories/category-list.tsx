"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Edit, Loader2, Plus, Search, Trash2 } from "lucide-react";
import useSWR from "swr";
import { getCategoriesAction } from "@/app/actions/category";
import { type Category, type CategoryListReq } from "@/types/category";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/admin/data-table-pagination";
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(
    undefined,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string>("");

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const name = searchParams.get("name") || undefined;

  const { data, isLoading, mutate } = useSWR({ page, pageSize, name }, fetcher);

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
    params.set("page", "1"); // Reset to page 1 on search
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("pageSize", newPageSize.toString());
    params.set("page", "1"); // Reset to page 1
    router.push(`?${params.toString()}`);
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const openDelete = (id: string) => {
    setDeletingId(id);
    setDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-color)]">
          分类管理
        </h2>
        <p className="text-[var(--text-color-secondary)]">
          管理博客文章的分类体系
        </p>
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
            <Search className="absolute top-3 left-3 z-10 h-4 w-4 text-[var(--text-color-secondary)]" />
            <Input
              name="query"
              placeholder="搜索分类..."
              defaultValue={name}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            搜索
          </Button>
        </form>
        <Button
          onClick={() => {
            setEditingCategory(undefined);
            setDialogOpen(true);
          }}
          className={`
            bg-[var(--accent-color)] text-white
            hover:bg-[var(--accent-color)]/90
          `}
        >
          <Plus className="mr-2 h-4 w-4" />
          新增分类
        </Button>
      </GlassCard>

      <GlassCard className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[var(--text-color-secondary)]">
                名称
              </TableHead>
              <TableHead className="text-[var(--text-color-secondary)]">
                Slug
              </TableHead>
              <TableHead className="text-[var(--text-color-secondary)]">
                描述
              </TableHead>
              <TableHead className="text-[var(--text-color-secondary)]">
                文章数
              </TableHead>
              <TableHead className="text-[var(--text-color-secondary)]">
                创建时间
              </TableHead>
              <TableHead className="text-right text-[var(--text-color-secondary)]">
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-[var(--text-color-secondary)]"
                >
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : data?.lists?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-[var(--text-color-secondary)]"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              data?.lists?.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium text-[var(--text-color)]">
                    {category.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-[var(--accent-color)] text-[var(--accent-color)]"
                    >
                      {category.slug}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-[var(--text-color-secondary)]">
                    {category.description || "-"}
                  </TableCell>
                  <TableCell className="text-[var(--text-color)]">
                    {category.blogCount}
                  </TableCell>
                  <TableCell className="text-[var(--text-color-secondary)]">
                    {formatSimpleDateWithTime(new Date(category.createdAt))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDelete(category.id)}
                        className={`
                          text-[var(--text-color-secondary)]
                          hover:bg-red-500/10 hover:text-red-500
                        `}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </GlassCard>

      <GlassCard className="p-2">
        {data && (
          <DataTablePagination
            currentPage={page}
            total={data.total}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </GlassCard>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
        onSuccess={() => mutate()}
      />

      <DeleteAlert
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        id={deletingId}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
