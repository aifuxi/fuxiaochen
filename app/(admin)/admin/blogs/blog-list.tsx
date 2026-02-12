"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, Edit, Plus, Search, Trash2 } from "lucide-react";
import useSWR from "swr";
import { getBlogsAction } from "@/app/actions/blog";
import { type BlogListReq } from "@/types/blog";
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

const fetcher = async (params: BlogListReq) => {
  const res = await getBlogsAction(params);
  if (!res.success) throw new Error(res.error);
  return res.data;
};

export default function BlogManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string>("");

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const title = searchParams.get("title") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;
  const sortBy = (searchParams.get("sortBy") as any) || "createdAt";
  const order = (searchParams.get("order") as any) || "desc";

  const { data, isLoading, mutate } = useSWR(
    { page, pageSize, title, categoryId, sortBy, order },
    fetcher,
  );

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

  const handlePageSizeChange = (newSize: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("pageSize", newSize.toString());
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const openDelete = (id: string) => {
    setDeletingId(id);
    setDeleteOpen(true);
  };

  const blogs = data?.lists || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-text uppercase">
          博客管理
        </h2>
      </div>

      {/* Filter Section */}
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
            <Search className="absolute top-3 left-3 z-10 h-4 w-4 text-text-secondary" />
            <Input
              name="query"
              placeholder="搜索文章标题..."
              defaultValue={title || ""}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary" hoverEffect="up">
            搜索
          </Button>
        </form>
        <Link href="/admin/blogs/new">
          <Button
            className={`
              bg-accent text-white
              hover:bg-accent/90
            `}
            hoverEffect="up"
          >
            <Plus className="mr-2 h-4 w-4" /> 新建文章
          </Button>
        </Link>
      </GlassCard>

      {/* Table Section */}
      <GlassCard className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow
              className={`
                border-glass-border
                hover:bg-glass-bg
              `}
            >
              <TableHead className="text-text-secondary">标题</TableHead>
              <TableHead className="text-text-secondary">分类</TableHead>
              <TableHead className="text-text-secondary">标签</TableHead>
              <TableHead className="text-text-secondary">发布状态</TableHead>
              <TableHead className="text-text-secondary">精选状态</TableHead>
              <TableHead
                className="cursor-pointer text-text-secondary"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center gap-1">
                  创建时间 <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="text-right text-text-secondary">
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-text-secondary"
                >
                  加载中...
                </TableCell>
              </TableRow>
            ) : blogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-text-secondary"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow
                  key={blog.id}
                  className={`
                    border-glass-border
                    hover:bg-accent/5
                  `}
                >
                  <TableCell className="font-medium text-text">
                    {blog.title}
                  </TableCell>
                  <TableCell>
                    {blog.category ? (
                      <Badge
                        variant="outline"
                        className="border-accent text-accent"
                      >
                        {blog.category.name}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {blog.tags && blog.tags.length > 0
                        ? blog.tags.map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="secondary"
                              className="bg-accent/10 text-xs text-accent"
                            >
                              {tag.name}
                            </Badge>
                          ))
                        : "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={blog.published ? "default" : "secondary"}
                      className={
                        blog.published
                          ? `
                            bg-accent/20 text-accent
                            hover:bg-accent/30
                          `
                          : "bg-glass-border text-text-secondary"
                      }
                    >
                      {blog.published ? "已发布" : "草稿"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-text-secondary">
                    <div className="flex flex-col items-end gap-1 text-xs">
                      <span>
                        创建:{" "}
                        {formatSimpleDateWithTime(new Date(blog.createdAt))}
                      </span>
                      <span>
                        更新:{" "}
                        {formatSimpleDateWithTime(new Date(blog.updatedAt))}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/blogs/${blog.id}`)}
                        className={`
                          text-text-secondary
                          hover:bg-accent/10 hover:text-accent
                        `}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDelete(blog.id)}
                        className={`
                          text-text-secondary
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

      {/* Pagination Section */}
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

      <DeleteAlert
        id={deletingId}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
