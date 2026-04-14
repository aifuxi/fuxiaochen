"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Category } from "@/types/category";
import type { Tag } from "@/types/tag";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState(currentFilters.title || "");

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      params.delete("page");
      router.push(`/blog?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      updateFilter("title", searchValue || null);
    },
    [updateFilter, searchValue],
  );

  const handleClearSearch = useCallback(() => {
    setSearchValue("");
    inputRef.current?.focus();
    updateFilter("title", null);
  }, [updateFilter]);

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

  const handleReset = useCallback(() => {
    setSearchValue("");
    router.push("/blog");
  }, [router]);

  const currentSort = `${currentFilters.sortBy || "createdAt"}_${currentFilters.order || "desc"}`;
  const hasActiveFilters =
    currentFilters.title || currentFilters.categoryId || currentFilters.tagId;

  return (
    <Card variant="glass" className="spotlight-card space-y-6 p-6">
      <form onSubmit={handleSearch} className="mx-auto max-w-2xl">
        <div className="relative">
          <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            name="title"
            type="text"
            placeholder="搜索博客、主题或关键词"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="h-12 rounded-full pr-12 pl-11 text-base"
          />
          {searchValue && (
            <button
              type="button"
              onClick={handleClearSearch}
              className={`
                absolute top-1/2 right-3 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full
                border border-white/10 bg-white/6 text-muted-foreground transition-colors
                duration-[var(--duration-fast)]
                hover:text-foreground
              `}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </form>

      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-label text-muted-foreground">分类</span>
          <Button
            type="button"
            size="sm"
            variant={!currentFilters.categoryId ? "primary" : "secondary"}
            onClick={() => updateFilter("categoryId", null)}
          >
            全部
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              type="button"
              size="sm"
              variant={
                currentFilters.categoryId === category.id
                  ? "primary"
                  : "secondary"
              }
              onClick={() => updateFilter("categoryId", category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-label text-muted-foreground">标签</span>
            <Button
              type="button"
              size="sm"
              variant={!currentFilters.tagId ? "outline" : "ghost"}
              onClick={() => updateFilter("tagId", null)}
            >
              全部
            </Button>
            {tags.map((tag) => (
              <Button
                key={tag.id}
                type="button"
                size="sm"
                variant={currentFilters.tagId === tag.id ? "outline" : "ghost"}
                onClick={() =>
                  updateFilter(
                    "tagId",
                    currentFilters.tagId === tag.id ? null : tag.id,
                  )
                }
              >
                {tag.name}
              </Button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-40">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleReset}
            >
              <X className="h-3.5 w-3.5" />
              重置筛选
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
