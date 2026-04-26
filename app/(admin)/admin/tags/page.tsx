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
          <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
          <p className="text-muted-foreground">
            Manage tags for better content discovery.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Tag</DialogTitle>
              <DialogDescription>
                Add a new tag for categorizing your blog posts.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Enter tag name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button disabled={isSubmitting} onClick={createTag}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border border-border p-6">
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
                <span className="sr-only">Remove tag</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Total Tags</p>
          <p className="text-2xl font-bold">{tags.length}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Most Used</p>
          <p className="text-2xl font-bold">{mostUsedTag?.slug ?? "n/a"}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Avg. per Post</p>
          <p className="text-2xl font-bold">{averagePerPost}</p>
        </div>
      </div>
    </div>
  );
}
