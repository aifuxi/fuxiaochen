"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowUpDown, Edit, Plus, Search, Trash2 } from "lucide-react";
import useSWR from "swr";
import {
  getBlogsAction,
  toggleBlogFeatureAction,
  toggleBlogPublishAction,
} from "@/app/actions/blog";
import { type BlogListReq } from "@/types/blog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Pagination } from "@/components/cyberpunk/pagination";
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

  const openDelete = (id: string) => {
    setDeletingId(id);
    setDeleteOpen(true);
  };

  const handleTogglePublish = async (id: string) => {
    await toggleBlogPublishAction(id);
    mutate();
  };

  const handleToggleFeature = async (id: string) => {
    await toggleBlogFeatureAction(id);
    mutate();
  };

  const blogs = data?.lists || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-wider text-neon-cyan uppercase">
          文章列表
        </h2>
        <Link href="/admin/blogs/new">
          <Button
            className={`
              bg-neon-cyan text-black
              hover:bg-cyan-400
            `}
          >
            <Plus className="mr-2 h-4 w-4" /> 新建文章
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <form
          onSubmit={handleSearch}
          className="flex flex-1 items-center gap-2"
        >
          <div className="relative max-w-sm flex-1">
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-500" />
            <Input
              name="query"
              placeholder="搜索文章标题..."
              defaultValue={title || ""}
              className={`
                border-white/10 bg-white/5 pl-9
                focus:border-neon-cyan focus:ring-neon-cyan/20
              `}
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            className={`
              border border-white/10 bg-white/5 text-gray-300
              hover:bg-white/10
            `}
          >
            搜索
          </Button>
        </form>
      </div>

      <div className="rounded-md border border-white/10 bg-black/40">
        <Table>
          <TableHeader>
            <TableRow
              className={`
                border-white/10
                hover:bg-white/5
              `}
            >
              <TableHead className="text-neon-purple">标题</TableHead>
              <TableHead className="text-neon-purple">分类</TableHead>
              <TableHead className="text-neon-purple">标签</TableHead>
              <TableHead className="text-neon-purple">发布状态</TableHead>
              <TableHead className="text-neon-purple">精选状态</TableHead>
              <TableHead
                className="cursor-pointer text-neon-purple"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center gap-1">
                  创建时间 <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="text-right text-neon-purple">
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-gray-500"
                >
                  加载中...
                </TableCell>
              </TableRow>
            ) : blogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-gray-500"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow
                  key={blog.id}
                  className={`
                    border-white/10
                    hover:bg-white/5
                  `}
                >
                  <TableCell className="font-medium text-white">
                    {blog.title}
                  </TableCell>
                  <TableCell>
                    {blog.category ? (
                      <Badge
                        variant="outline"
                        className="border-neon-purple text-neon-purple"
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
                              className="bg-white/10 text-xs"
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
                      onCheckedChange={() => void handleTogglePublish(blog.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={blog.featured}
                      onCheckedChange={() => void handleToggleFeature(blog.id)}
                    />
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {format(new Date(blog.createdAt), "yyyy-MM-dd HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/blogs/${blog.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`
                            text-neon-cyan
                            hover:bg-neon-cyan/10 hover:text-neon-cyan
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
                          text-red-500
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
      </div>

      {data && (
        <Pagination
          currentPage={page}
          total={data.total}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      )}

      <DeleteAlert
        id={deletingId}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
