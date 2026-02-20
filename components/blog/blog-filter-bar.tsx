"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search } from "lucide-react";
import type { Category } from "@/types/category";
import type { Tag } from "@/types/tag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BlogFilterBarProps {
  categories: Category[];
  tags: Tag[];
  currentFilters: {
    title?: string;
    categoryId?: string;
    tagId?: string;
    sortBy?: "createdAt" | "updatedAt";
    order?: "asc" | "desc";
  };
}

const sortOptions = [
  { value: "createdAt_desc", label: "最新发布" },
  { value: "createdAt_asc", label: "最早发布" },
  { value: "updatedAt_desc", label: "最近更新" },
  { value: "updatedAt_asc", label: "最早更新" },
];

export function BlogFilterBar({
  categories,
  tags,
  currentFilters,
}: BlogFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      // 重置页码
      params.delete("page");

      router.push(`/blog?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const title = formData.get("title") as string;
      updateFilter("title", title || null);
    },
    [updateFilter],
  );

  const handleSortChange = useCallback(
    (value: string) => {
      const [sortBy, order] = value.split("_");
      const params = new URLSearchParams(searchParams.toString());
      if (sortBy) params.set("sortBy", sortBy);
      if (order) params.set("order", order);
      params.delete("page");
      router.push(`/blog?${params.toString()}`);
    },
    [router, searchParams],
  );

  const currentSort = `${currentFilters.sortBy || "createdAt"}_${currentFilters.order || "desc"}`;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* 搜索框 */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          name="title"
          placeholder="搜索博客..."
          defaultValue={currentFilters.title || ""}
          className="w-48"
        />
        <Button type="submit" variant="secondary" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {/* 分类选择 */}
      <Select
        value={currentFilters.categoryId || "all"}
        onValueChange={(value) => updateFilter("categoryId", value)}
      >
        <SelectTrigger className="w-32">
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

      {/* 标签选择 */}
      <Select
        value={currentFilters.tagId || "all"}
        onValueChange={(value) => updateFilter("tagId", value)}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="全部标签" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部标签</SelectItem>
          {tags.map((tag) => (
            <SelectItem key={tag.id} value={tag.id}>
              {tag.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 排序选择 */}
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="排序方式" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
