# 博客页面 Apple 设计重构实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将博客列表页面重构为 Apple 大胆风格，保持筛选搜索功能完整

**Architecture:** Hero 区域使用渐变背景 + 大标题，筛选栏融入 Hero 底部，分类/标签改为标签按钮组，卡片优化圆角和 hover 效果

**Tech Stack:** React, Next.js, Tailwind CSS, Radix UI

---

## Task 1: 重构博客卡片样式

**Files:**
- Modify: `components/blog/blog-card.tsx`

**Step 1: 优化卡片圆角和 hover 效果**

替换 Card 组件的 className：

```tsx
<Card className={`
  group overflow-hidden rounded-2xl p-0 transition-all duration-300 ease-apple
  hover:-translate-y-0.5 hover:shadow-lg
`}>
```

**Step 2: 优化封面图容器**

替换封面图容器的 className：

```tsx
<div className={`
  relative h-40 w-40 shrink-0 overflow-hidden
  sm:h-48 sm:w-48
`}>
  {blog.cover && (
    <Image
      src={blog.cover}
      alt={blog.title}
      width={192}
      height={192}
      className={`
        h-full w-full object-cover transition-transform duration-500
        group-hover:scale-105
      `}
    />
  )}
</div>
```

**Step 3: 验证构建**

Run: `pnpm build`

确保无错误。

**Step 4: 提交**

```bash
git add components/blog/blog-card.tsx
git commit -m "refactor(blog-card): 优化卡片圆角和 hover 效果"
```

---

## Task 2: 重构筛选栏 - 搜索框和标签组

**Files:**
- Modify: `components/blog/blog-filter-bar.tsx`

**Step 1: 重写整个筛选栏组件**

完整替换文件内容：

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
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
    <div className="space-y-6">
      {/* 搜索框 */}
      <form onSubmit={handleSearch} className="mx-auto max-w-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
          <input
            name="title"
            type="text"
            placeholder="搜索博客..."
            defaultValue={currentFilters.title || ""}
            className={`
              w-full rounded-2xl border border-border bg-surface/50 py-4 pr-4 pl-12 text-base
              text-text placeholder:text-text-tertiary
              transition-all duration-200
              focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/20
            `}
          />
        </div>
      </form>

      {/* 筛选标签组 */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* 分类标签 */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => updateFilter("categoryId", null)}
            className={`
              rounded-full px-4 py-2 text-sm font-medium transition-all duration-200
              ${!currentFilters.categoryId
                ? "bg-accent text-white"
                : "bg-surface/50 text-text-secondary hover:bg-surface"
              }
            `}
          >
            全部分类
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => updateFilter("categoryId", category.id)}
              className={`
                rounded-full px-4 py-2 text-sm font-medium transition-all duration-200
                ${currentFilters.categoryId === category.id
                  ? "bg-accent text-white"
                  : "bg-surface/50 text-text-secondary hover:bg-surface"
                }
              `}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* 分隔线 */}
        {tags.length > 0 && <div className="h-6 w-px bg-border" />}

        {/* 标签 */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {tags.slice(0, 6).map((tag) => (
            <button
              key={tag.id}
              onClick={() => updateFilter("tagId", currentFilters.tagId === tag.id ? null : tag.id)}
              className={`
                rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200
                ${currentFilters.tagId === tag.id
                  ? "bg-accent text-white"
                  : "bg-surface/50 text-text-secondary hover:bg-surface"
                }
              `}
            >
              {tag.name}
            </button>
          ))}
        </div>

        {/* 排序 */}
        <div className="ml-auto">
          <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-32 rounded-full border-border bg-surface/50">
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
        </div>
      </div>
    </div>
  );
}
```

**Step 2: 验证构建**

Run: `pnpm build`

确保无错误。

**Step 3: 提交**

```bash
git add components/blog/blog-filter-bar.tsx
git commit -m "refactor(blog-filter-bar): 重构为 Apple 标签按钮风格"
```

---

## Task 3: 重构博客页面 Hero 区域

**Files:**
- Modify: `app/(site)/blog/page.tsx`

**Step 1: 重写页面组件**

完整替换文件内容：

```tsx
import { Suspense } from "react";
import { getBlogsAction } from "@/app/actions/blog";
import { getCategoriesAction } from "@/app/actions/category";
import { getTagsAction } from "@/app/actions/tag";
import { BlogFilterBar } from "@/components/blog/blog-filter-bar";
import { BlogList } from "@/components/blog/blog-list";
import { Loader2 } from "lucide-react";

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    title?: string;
    categoryId?: string;
    tagId?: string;
    sortBy?: "createdAt" | "updatedAt";
    order?: "asc" | "desc";
  }>;
}

const DEFAULT_PAGE_SIZE = 10;

// Hero 区域 - Apple 大胆风格
function Hero({
  categories,
  tags,
  currentFilters,
}: {
  categories: Awaited<ReturnType<typeof getCategoriesAction>>["data"] extends { lists: infer T } | null ? T : never;
  tags: Awaited<ReturnType<typeof getTagsAction>>["data"] extends { lists: infer T } | null ? T : never;
  currentFilters: {
    title?: string;
    categoryId?: string;
    tagId?: string;
    sortBy?: "createdAt" | "updatedAt";
    order?: "asc" | "desc";
  };
}) {
  return (
    <section
      className={`
        relative flex min-h-[50vh] flex-col items-center justify-center overflow-hidden py-20
        md:min-h-[60vh] md:py-28
      `}
    >
      {/* 动态渐变背景 */}
      <div
        className={`
          pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]
          from-accent/10 via-transparent to-transparent
        `}
      />
      <div
        className={`
          pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full
          bg-gradient-to-b from-accent/5 via-info/5 to-transparent blur-3xl
        `}
      />

      {/* 内容 */}
      <div className="relative z-10 mx-auto w-full max-w-4xl px-4">
        {/* 标题 */}
        <div className="mb-10 text-center">
          <h1
            className={`
              mb-4 text-5xl font-bold tracking-tight text-text
              md:text-7xl
            `}
          >
            Blog
          </h1>
          <p className="text-lg text-text-secondary md:text-xl">
            探索技术文章与学习笔记
          </p>
        </div>

        {/* 筛选栏 */}
        <BlogFilterBar
          categories={categories || []}
          tags={tags || []}
          currentFilters={currentFilters}
        />
      </div>
    </section>
  );
}

async function BlogListContent({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const pageSize = parseInt(params.pageSize || String(DEFAULT_PAGE_SIZE), 10);

  const [blogsResult, categoriesResult, tagsResult] = await Promise.all([
    getBlogsAction({
      page,
      pageSize,
      title: params.title,
      categoryId: params.categoryId,
      tagId: params.tagId,
      sortBy: params.sortBy || "createdAt",
      order: params.order || "desc",
      published: true,
    }),
    getCategoriesAction({ page: 1, pageSize: 100 }),
    getTagsAction({ page: 1, pageSize: 100 }),
  ]);

  if (!blogsResult.success || !categoriesResult.success || !tagsResult.success) {
    throw new Error("获取数据失败");
  }

  if (!blogsResult.data) {
    throw new Error("获取博客数据失败");
  }

  const blogs = blogsResult.data;
  const categories = categoriesResult.data?.lists || [];
  const tags = tagsResult.data?.lists || [];

  const baseUrl = `/blog?title=${params.title || ""}&categoryId=${params.categoryId || ""}&tagId=${params.tagId || ""}&sortBy=${params.sortBy || "createdAt"}&order=${params.order || "desc"}`;

  return (
    <>
      <Hero
        categories={categories}
        tags={tags}
        currentFilters={{
          title: params.title,
          categoryId: params.categoryId,
          tagId: params.tagId,
          sortBy: params.sortBy || "createdAt",
          order: params.order || "desc",
        }}
      />

      {/* 博客列表 */}
      <div className="mx-auto max-w-4xl px-4 pb-16">
        <BlogList
          blogs={blogs.lists || []}
          total={blogs.total}
          currentPage={page}
          pageSize={pageSize}
          baseUrl={baseUrl}
        />
      </div>
    </>
  );
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-text-secondary" />
        </div>
      }
    >
      <BlogListContent searchParams={searchParams} />
    </Suspense>
  );
}
```

**Step 2: 验证构建**

Run: `pnpm build`

确保无错误。

**Step 3: 提交**

```bash
git add "app/(site)/blog/page.tsx"
git commit -m "refactor(blog): 重构为 Apple 大胆风格 Hero 区域"
```

---

## Task 4: 最终验证

**Step 1: 完整功能测试**

Run: `pnpm dev`

检查清单：
- [ ] Hero 区域显示正确，渐变背景正常
- [ ] 搜索框功能正常，可输入关键词搜索
- [ ] 分类标签点击可筛选，选中态高亮
- [ ] 标签点击可筛选，选中态高亮
- [ ] 排序下拉功能正常
- [ ] 博客卡片 hover 效果正常
- [ ] 分页功能正常
- [ ] 暗色模式下样式正确

**Step 2: 代码检查**

Run: `pnpm lint:fix && pnpm build`

确保无 lint 错误，构建成功。

**Step 3: 合并提交（如有多个小提交）**

如果需要，可以合并为一个提交：

```bash
# 可选：重置到重构前的提交，然后重新提交所有变更
```

---

## 完成标准

- ✅ Hero 区域使用 Apple 大胆风格
- ✅ 筛选栏融入 Hero，搜索框放大居中
- ✅ 分类/标签改为标签按钮样式
- ✅ 博客卡片 hover 效果优化
- ✅ 所有筛选搜索功能正常工作
- ✅ 构建无错误
