"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, Edit, Plus, Search, Trash2 } from "lucide-react";
import useSWR from "swr";
import { getTagsAction } from "@/app/actions/tag";
import { type Tag, type TagListReq } from "@/types/tag";
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | undefined>(undefined);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string>("");

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const name = searchParams.get("name") || undefined;
  const sortBy = (searchParams.get("sortBy") as any) || "createdAt";
  const order = (searchParams.get("order") as any) || "desc";

  const { data, isLoading, mutate } = useSWR(
    { page, pageSize, name, sortBy, order },
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
    params.set("page", "1"); // Reset to page 1 on search
    router.push(`?${params.toString()}`);
  };

  const handleSort = (field: "createdAt" | "updatedAt") => {
    const params = new URLSearchParams(searchParams);
    const currentSort = params.get("sortBy");
    const currentOrder = params.get("order");

    if (currentSort === field) {
      params.set("order", currentOrder === "asc" ? "desc" : "asc");
    } else {
      params.set("sortBy", field);
      params.set("order", "desc");
    }
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

  const openEdit = (tag: Tag) => {
    setEditingTag(tag);
    setDialogOpen(true);
  };

  const openDelete = (id: string) => {
    setDeletingId(id);
    setDeleteOpen(true);
  };

  const openCreate = () => {
    setEditingTag(undefined);
    setDialogOpen(true);
  };

  const tags = data?.lists || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-color)]">
          标签管理
        </h2>
        <p className="text-[var(--text-color-secondary)]">
          管理博客文章的标签体系
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
              placeholder="搜索标签名称..."
              defaultValue={name || ""}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            搜索
          </Button>
        </form>
        <Button
          onClick={openCreate}
          className={`
            bg-[var(--accent-color)] text-white
            hover:bg-[var(--accent-color)]/90
          `}
          hoverEffect="up"
        >
          <Plus className="mr-2 h-4 w-4" /> 新建标签
        </Button>
        {`


          `}
      </GlassCard>

      <GlassCard className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>文章数</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center gap-1">
                  创建时间 <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("updatedAt")}
              >
                <div className="flex items-center gap-1">
                  更新时间 <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-[var(--text-color-secondary)]"
                >
                  加载中...
                </TableCell>
              </TableRow>
            ) : tags.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-[var(--text-color-secondary)]"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium text-[var(--text-color)]">
                    {tag.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[var(--text-color-secondary)]">
                    {tag.slug}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-[var(--accent-color)]/10 text-[var(--accent-color)]"
                    >
                      {tag.blogCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[var(--text-color-secondary)]">
                    {formatSimpleDateWithTime(new Date(tag.createdAt))}
                  </TableCell>
                  <TableCell className="text-[var(--text-color-secondary)]">
                    {formatSimpleDateWithTime(new Date(tag.updatedAt))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(tag)}
                        className={`
                          text-[var(--text-color-secondary)]
                          hover:bg-[var(--accent-color)]/10 hover:text-[var(--accent-color)]
                        `}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDelete(tag.id)}
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

      <TagDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tag={editingTag}
        onSuccess={() => mutate()}
      />

      <DeleteAlert
        id={deletingId}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
