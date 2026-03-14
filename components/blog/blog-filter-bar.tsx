"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Category } from "@/types/category";
import type { Tag } from "@/types/tag";
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
    if (inputRef.current) {
      inputRef.current.focus();
    }
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
    currentFilters.title ||
    currentFilters.categoryId ||
    currentFilters.tagId;

  return (
    <div className="space-y-6">
      {/* 搜索框 */}
      <form onSubmit={handleSearch} className="mx-auto max-w-xl">
        <div className="relative">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            name="title"
            type="text"
            placeholder="搜索博客..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className={`
              w-full rounded-2xl border border-border bg-muted/50 py-4 pr-12 pl-12 text-base text-foreground
              transition-all duration-200
              placeholder:text-muted-foreground
              focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none
            `}
          />
          {searchValue && (
            <button
              type="button"
              onClick={handleClearSearch}
              className={`
                absolute top-1/2 right-4 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full
                bg-accent text-muted-foreground transition-colors
                hover:bg-border hover:text-foreground
              `}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* 筛选区域 */}
      <div className="space-y-4">
        {/* 分类筛选 */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">分类：</span>
          <button
            type="button"
            onClick={() => updateFilter("categoryId", null)}
            className={`
              rounded-full px-4 py-2 text-sm font-medium transition-all duration-200
              ${!currentFilters.categoryId
                ? "bg-primary text-primary-foreground"
                : `
                  bg-muted/50 text-muted-foreground
                  hover:bg-accent
                `
              }
            `}
          >
            全部
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => updateFilter("categoryId", category.id)}
              className={`
                rounded-full px-4 py-2 text-sm font-medium transition-all duration-200
                ${currentFilters.categoryId === category.id
                  ? "bg-primary text-primary-foreground"
                  : `
                    bg-muted/50 text-muted-foreground
                    hover:bg-accent
                  `
                }
              `}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* 标签筛选 */}
        {tags.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">标签：</span>
            <button
              type="button"
              onClick={() => updateFilter("tagId", null)}
              className={`
                rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200
                ${!currentFilters.tagId
                  ? "bg-primary text-primary-foreground"
                  : `
                    bg-muted/50 text-muted-foreground
                    hover:bg-accent
                  `
                }
              `}
            >
              全部
              </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() =>
                  updateFilter(
                    "tagId",
                    currentFilters.tagId === tag.id ? null : tag.id,
                  )
                }
                className={`
                  rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200
                  ${currentFilters.tagId === tag.id
                    ? "bg-primary text-primary-foreground"
                    : `
                      bg-muted/50 text-muted-foreground
                      hover:bg-accent
                    `
                  }
                `}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}

        {/* 排序和重置 */}
        <div className="flex items-center justify-center gap-3">
          <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger
              className={`
                w-36 rounded-full border-border bg-muted/50
                focus:ring-primary/20
              `}
            >
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

          {/* 重置按钮 */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className={`
                inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-4 py-2 text-sm font-medium
                text-muted-foreground transition-all duration-200
                hover:bg-accent hover:text-foreground
              `}
            >
              <X className="h-3.5 w-3.5" />
              重置筛选
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
