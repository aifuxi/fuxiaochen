"use client";

import { useState } from "react";

import { Plus, X } from "lucide-react";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { apiRequest, fetchApiData } from "@/lib/api/fetcher";
import type { AdminBlog } from "@/lib/server/blogs/mappers";
import type { AdminTag } from "@/lib/server/tags/mappers";

export default function AdminTagsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, mutate } = useSWR<{ items: AdminTag[] }>(
    "/api/admin/tags?pageSize=100&sortBy=name&sortDirection=asc",
    fetchApiData,
    {
      revalidateOnFocus: false,
    },
  );
  const { data: blogsData } = useSWR<{ items: AdminBlog[] }>(
    "/api/admin/blogs?pageSize=100&sortBy=updatedAt&sortDirection=desc",
    fetchApiData,
    {
      revalidateOnFocus: false,
    },
  );

  const tags = data?.items ?? [];
  const blogs = blogsData?.items ?? [];
  const mostUsedTag = [...tags].sort((a, b) => b.blogCount - a.blogCount)[0];
  const averagePerPost =
    blogs.length === 0
      ? "0.0"
      : (
          blogs.reduce((sum, blog) => sum + blog.tags.length, 0) / blogs.length
        ).toFixed(1);

  const createTag = async () => {
    if (!newTag.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest("/api/admin/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newTag.trim(),
        }),
      });
      setNewTag("");
      setIsDialogOpen(false);
      await mutate();
    } catch {
      // The global API error listener owns toast display.
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTag = async (id: string) => {
    try {
      await apiRequest(`/api/admin/tags/${id}`, {
        method: "DELETE",
      });
      await mutate();
    } catch {
      // The global API error listener owns toast display.
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">标签</h1>
          <p className="text-muted-foreground">更好地管理文章标签。</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新建标签
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新建标签</DialogTitle>
              <DialogDescription>
                添加新标签，方便后续对文章进行归类。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">名称</Label>
                <Input
                  id="name"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="输入标签名称"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button disabled={isSubmitting} onClick={createTag}>
                创建
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border border-border p-6">
        {tags.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            暂无标签，先新建一个标签吧。
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="group flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 transition-colors hover:border-primary/50"
              >
                <span className="font-medium">{tag.slug}</span>
                <Badge variant="secondary" className="text-xs">
                  {tag.blogCount}
                </Badge>
                <button
                  className="ml-1 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => deleteTag(tag.id)}
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  <span className="sr-only">移除标签</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">标签总数</p>
          <p className="text-2xl font-bold">{tags.length}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">使用最多</p>
          <p className="text-2xl font-bold">{mostUsedTag?.slug ?? "无"}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">平均每篇文章</p>
          <p className="text-2xl font-bold">{averagePerPost}</p>
        </div>
      </div>
    </div>
  );
}
