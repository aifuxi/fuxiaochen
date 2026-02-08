"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, Edit, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";
import {
  getBlogsAction,
  toggleBlogFeatureAction,
  toggleBlogPublishAction,
} from "@/app/actions/blog";
import { type BlogListReq } from "@/types/blog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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

interface BlogManagementPageProps {
  role?: string;
}

export default function BlogManagementPage({ role }: BlogManagementPageProps) {
  const isAdmin = role === "admin";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string>("");

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const title = searchParams.get("title") || undefined;
  const sortBy = (searchParams.get("sortBy") as any) || "createdAt";
  const order = (searchParams.get("order") as any) || "desc";

  const { data, isLoading, mutate } = useSWR(
    { page, pageSize, title, sortBy, order },
    fetcher,
  );

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("query") as string;

    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set("title", query);
    } else {
      params.delete("title");
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

  const handleTogglePublish = async (id: string) => {
    if (!isAdmin) {
      toast.error("无权限");
      return;
    }
    await toggleBlogPublishAction(id);
    mutate();
  };

  const handleToggleFeature = async (id: string) => {
    if (!isAdmin) {
      toast.error("无权限");
      return;
    }
    await toggleBlogFeatureAction(id);
    mutate();
  };

  const blogs = data?.lists || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-color)] uppercase">
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
            <Search className="absolute top-3 left-3 z-10 h-4 w-4 text-[var(--text-color-secondary)]" />
            <Input
              name="query"
              placeholder="搜索文章标题..."
              defaultValue={title || ""}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            搜索
          </Button>
        </form>
        <Link href="/admin/blogs/new">
          <Button
            className={`
              bg-[var(--accent-color)] text-white
              hover:bg-[var(--accent-color)]/90
            `}
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
                border-[var(--glass-border)]
                hover:bg-[var(--glass-bg)]
              `}
            >
              <TableHead className="text-[var(--text-color-secondary)]">
                标题
              </TableHead>
              <TableHead className="text-[var(--text-color-secondary)]">
                分类
              </TableHead>
              <TableHead className="text-[var(--text-color-secondary)]">
                标签
              </TableHead>
              <TableHead className="text-[var(--text-color-secondary)]">
                发布状态
              </TableHead>
              <TableHead className="text-[var(--text-color-secondary)]">
                精选状态
              </TableHead>
              <TableHead
                className="cursor-pointer text-[var(--text-color-secondary)]"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center gap-1">
                  创建时间 <ArrowUpDown className="h-3 w-3" />
                </div>
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
                  colSpan={7}
                  className="h-24 text-center text-[var(--text-color-secondary)]"
                >
                  加载中...
                </TableCell>
              </TableRow>
            ) : blogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-[var(--text-color-secondary)]"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow
                  key={blog.id}
                  className={`
                    border-[var(--glass-border)]
                    hover:bg-[var(--accent-color)]/5
                  `}
                >
                  <TableCell className="font-medium text-[var(--text-color)]">
                    {blog.title}
                  </TableCell>
                  <TableCell>
                    {blog.category ? (
                      <Badge variant="outline">{blog.category.name}</Badge>
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
                              className="bg-[var(--glass-bg)] text-[var(--text-color-secondary)]"
                            >
                              {tag.name}
                            </Badge>
                          ))
                        : "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={blog.published}
                      disabled={!isAdmin}
                      onCheckedChange={() => void handleTogglePublish(blog.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={blog.featured}
                      disabled={!isAdmin}
                      onCheckedChange={() => void handleToggleFeature(blog.id)}
                    />
                  </TableCell>
                  <TableCell className="text-[var(--text-color-secondary)]">
                    {formatSimpleDateWithTime(new Date(blog.createdAt))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/blogs/${blog.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`
                            text-[var(--text-color-secondary)]
                            hover:bg-[var(--accent-color)]/10 hover:text-[var(--accent-color)]
                          `}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDelete(blog.id)}
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
