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
import { toast } from "sonner";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  apiRequest,
  fetchApiData,
  getApiErrorMessage,
} from "@/lib/api/fetcher";
import type { AdminBlog } from "@/lib/server/blogs/mappers";
import type { AdminCategory } from "@/lib/server/categories/mappers";

import { routes } from "@/constants/routes";

export default function AdminPostsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: blogsData, mutate: mutateBlogs } = useSWR<{
    items: AdminBlog[];
  }>(
    "/api/admin/blogs?pageSize=100&sortBy=updatedAt&sortDirection=desc",
    fetchApiData,
    {
      revalidateOnFocus: false,
    },
  );
  const { data: categoriesData } = useSWR<{ items: AdminCategory[] }>(
    "/api/admin/categories?pageSize=100&sortBy=name&sortDirection=asc",
    fetchApiData,
    {
      revalidateOnFocus: false,
    },
  );

  const blogs = blogsData?.items ?? [];
  const categories = categoriesData?.items ?? [];

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
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete posts"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
          <p className="text-muted-foreground">
            Manage your blog posts and content.
          </p>
        </div>
        <Button asChild>
          <Link href={routes.admin.postsNew}>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
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
              {selectedPosts.length} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => deletePosts(selectedPosts)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
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
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedPosts.includes(post.id)}
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
                    ? new Date(post.publishedAt).toLocaleDateString()
                    : "Draft"}
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
                    {post.published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={routes.site.blogPost(post.slug)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/posts/${post.slug}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deletePosts([post.id])}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {filteredPosts.length} of {blogs.length} posts
        </p>
      </div>
    </div>
  );
}
