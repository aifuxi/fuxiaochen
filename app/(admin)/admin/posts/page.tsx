"use client";

import { useState } from "react";

import Link from "next/link";

import {
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { showAdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import {
  AdminTableErrorRow,
  AdminTableLoadingRow,
} from "@/components/admin/admin-loading-state";

import { apiRequest, fetchApiData } from "@/lib/api/fetcher";
import type { AdminBlog } from "@/lib/server/blogs/mappers";
import type { AdminCategory } from "@/lib/server/categories/mappers";

import { routes } from "@/constants/routes";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  dateStyle: "medium",
});

export default function AdminPostsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: blogsData,
    error: blogsError,
    isLoading: areBlogsLoading,
    mutate: mutateBlogs,
  } = useSWR<{
    items: AdminBlog[];
  }>(
    "/api/admin/blogs?pageSize=100&sortBy=updatedAt&sortDirection=desc",
    fetchApiData,
    {
      revalidateOnFocus: false,
    },
  );
  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: areCategoriesLoading,
    mutate: mutateCategories,
  } = useSWR<{ items: AdminCategory[] }>(
    "/api/admin/categories?pageSize=100&sortBy=name&sortDirection=asc",
    fetchApiData,
    {
      revalidateOnFocus: false,
    },
  );

  const blogs = blogsData?.items ?? [];
  const categories = categoriesData?.items ?? [];
  const isLoading = areBlogsLoading || areCategoriesLoading;
  const error = blogsError ?? categoriesError;

  const filteredPosts = blogs.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || post.category?.id === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const toggleSelectAll = () => {
    if (selectedPosts.length === filteredPosts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(filteredPosts.map((post) => post.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedPosts((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };

  const deletePosts = async (ids: string[]) => {
    if (ids.length === 0) {
      return;
    }

    setIsDeleting(true);

    try {
      await Promise.all(
        ids.map((id) =>
          apiRequest(`/api/admin/blogs/${id}`, {
            method: "DELETE",
          }),
        ),
      );
      setSelectedPosts([]);
      await mutateBlogs();
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDeletePosts = (ids: string[]) => {
    if (ids.length === 0) {
      return;
    }

    void showAdminConfirmDialog({
      title: ids.length > 1 ? "确认删除这些文章？" : "确认删除这篇文章？",
      description:
        ids.length > 1
          ? `将删除选中的 ${ids.length} 篇文章，关联评论也会一并删除。此操作无法撤销。`
          : "将删除这篇文章，关联评论也会一并删除。此操作无法撤销。",
      confirmingLabel: "正在删除...",
      onConfirm: () => deletePosts(ids),
    });
  };

  const retryLoading = () => {
    void mutateBlogs();
    void mutateCategories();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">文章</h1>
          <p className="text-muted-foreground">管理博客文章与内容。</p>
        </div>
        <Button asChild>
          <Link href={routes.admin.postsNew}>
            <Plus className="mr-2 h-4 w-4" />
            新建文章
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索文章..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger
              className="w-[180px]"
              disabled={areCategoriesLoading || Boolean(categoriesError)}
            >
              <SelectValue placeholder="全部分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedPosts.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedPosts.length} 条已选择
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => confirmDeletePosts(selectedPosts)}
            >
              {isDeleting ? <Spinner data-icon="inline-start" /> : null}
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedPosts.length === filteredPosts.length &&
                    filteredPosts.length > 0
                  }
                  disabled={
                    isLoading || isDeleting || filteredPosts.length === 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>标题</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>日期</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <AdminTableLoadingRow colSpan={6} label="正在加载文章..." />
            ) : null}
            {!isLoading && error ? (
              <AdminTableErrorRow
                colSpan={6}
                label="文章加载失败"
                onRetry={retryLoading}
              />
            ) : null}
            {!isLoading && !error && filteredPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <div className="space-y-1 text-muted-foreground">
                    <p className="font-medium">暂无文章</p>
                    <p className="text-sm">
                      可以新建一篇文章，或者调整筛选条件。
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : null}
            {!isLoading && !error
              ? filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedPosts.includes(post.id)}
                        disabled={isDeleting}
                        onCheckedChange={() => toggleSelect(post.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {post.featured && (
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        )}
                        <div>
                          <p className="font-medium">{post.title}</p>
                          <p className="max-w-md truncate text-sm text-muted-foreground">
                            {post.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {post.category ? (
                        <Badge variant="secondary">{post.category.name}</Badge>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {post.publishedAt
                        ? dateFormatter.format(new Date(post.publishedAt))
                        : "草稿"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          post.published
                            ? "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400"
                            : "border-border bg-muted text-muted-foreground"
                        }
                      >
                        {post.published ? "已发布" : "草稿"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isDeleting}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">操作</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={routes.site.blogPost(post.slug)}>
                              <Eye className="mr-2 h-4 w-4" />
                              查看
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={routes.admin.postEdit(post.slug)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              编辑
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            disabled={isDeleting}
                            onClick={() => confirmDeletePosts([post.id])}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          显示 {filteredPosts.length} / {blogs.length} 篇文章
        </p>
      </div>
    </div>
  );
}
