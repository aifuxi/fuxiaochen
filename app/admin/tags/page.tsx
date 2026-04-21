"use client";

import { useState } from "react";

import { Plus, X } from "lucide-react";

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

import { blogPosts, getAllTags } from "@/lib/blog-data";

export default function AdminTagsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState("");

  const tags = getAllTags();

  const getTagCount = (tag: string) => {
    return blogPosts.filter((p) => p.tags.includes(tag)).length;
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
              <Button onClick={() => setIsDialogOpen(false)}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tags Grid */}
      <div className="border-border rounded-lg border p-6">
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <div
              key={tag}
              className="group border-border bg-card hover:border-primary/50 flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors"
            >
              <span className="font-medium">{tag}</span>
              <Badge variant="secondary" className="text-xs">
                {getTagCount(tag)}
              </Badge>
              <button className="ml-1 opacity-0 transition-opacity group-hover:opacity-100">
                <X className="text-muted-foreground hover:text-destructive h-3.5 w-3.5" />
                <span className="sr-only">Remove tag</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border-border rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Total Tags</p>
          <p className="text-2xl font-bold">{tags.length}</p>
        </div>
        <div className="border-border rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Most Used</p>
          <p className="text-2xl font-bold">react</p>
        </div>
        <div className="border-border rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Avg. per Post</p>
          <p className="text-2xl font-bold">
            {(
              blogPosts.reduce((acc, p) => acc + p.tags.length, 0) /
              blogPosts.length
            ).toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
}
