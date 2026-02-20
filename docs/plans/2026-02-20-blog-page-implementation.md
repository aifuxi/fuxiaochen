# 博客页面实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现博客列表页和博客详情页，支持分类/标签筛选、标题搜索、排序和分页功能。

**Architecture:** 使用 Next.js Server Components + URL SearchParams 管理状态，服务端直接调用 Store 层获取数据，筛选条件通过 URL 参数传递。

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Prisma, Radix UI

---

## Task 1: 修改 BlogStore 支持 sortBy 和 order 参数

**Files:**
- Modify: `stores/blog/store.ts:142-189`

**Step 1: 添加排序参数到 findAll 方法**

修改 `stores/blog/store.ts` 中的 `findAll` 方法，解构 `sortBy` 和 `order` 参数：

```typescript
async findAll(params?: BlogListReq): Promise<BlogListResp> {
  const {
    page = 1,
    pageSize = 10,
    title,
    categoryId,
    tagId,
    published,
    sortBy = 'createdAt',
    order = 'desc',
  } = params || {};

  const skip = (page - 1) * pageSize;
  const where: Prisma.BlogWhereInput = { deletedAt: null };

  if (title) where.title = { contains: title };
  if (published !== undefined) where.published = published;
  if (categoryId) where.categoryId = categoryId;

  if (tagId) {
    where.tags = {
      some: {
        tagId: tagId,
      },
    };
  }

  const orderBy = { [sortBy]: order };

  const [total, list] = await Promise.all([
    prisma.blog.count({ where }),
    prisma.blog.findMany({
      where,
      skip,
      take: pageSize,
      orderBy,
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    }),
  ]);

  return {
    total,
    lists: list.map(this.mapToDomain),
  };
}
```

**Step 2: 验证修改**

运行: `pnpm build`
预期: 构建成功，无类型错误

**Step 3: 提交**

```bash
git add stores/blog/store.ts
git commit -m "feat(blog): BlogStore 添加 sortBy 和 order 参数支持"
```

---

## Task 2: 创建 BlogCard 组件

**Files:**
- Create: `components/blog/blog-card.tsx`

**Step 1: 创建 BlogCard 组件**

```tsx
import Image from "next/image";
import Link from "next/link";
import type { Blog } from "@/types/blog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/typography/text";
import { formatSimpleDate } from "@/lib/time";

interface BlogCardProps {
  blog: Blog;
}

export function BlogCard({ blog }: BlogCardProps) {
  return (
    <Card className="group overflow-hidden p-0 transition-all duration-200 ease-apple hover:shadow-md">
      <Link href={`/blog/${blog.slug}`} className="flex gap-4">
        {/* 封面图 */}
        {blog.cover && (
          <div className="h-40 w-40 shrink-0 overflow-hidden sm:h-48 sm:w-48">
            <Image
              src={blog.cover}
              alt={blog.title}
              width={192}
              height={192}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </div>
        )}

        {/* 内容区 */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          {/* 标题 */}
          <h3 className="line-clamp-1 text-lg font-semibold text-text transition-colors group-hover:text-accent">
            {blog.title}
          </h3>

          {/* 描述 */}
          <Text
            type="secondary"
            className="line-clamp-2 text-sm"
          >
            {blog.description}
          </Text>

          {/* 底部元信息 */}
          <div className="mt-auto flex flex-wrap items-center gap-2">
            {/* 分类 */}
            {blog.category && (
              <Badge variant="secondary" className="text-xs">
                {blog.category.name}
              </Badge>
            )}

            {/* 标签 */}
            {blog.tags?.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            ))}

            {/* 时间 */}
            <Text type="secondary" size="sm" className="ml-auto">
              {formatSimpleDate(new Date(blog.createdAt))}
            </Text>
          </div>
        </div>
      </Link>
    </Card>
  );
}
```

**Step 2: 验证组件**

运行: `pnpm build`
预期: 构建成功，无类型错误

**Step 3: 提交**

```bash
git add components/blog/blog-card.tsx
git commit -m "feat(blog): 创建 BlogCard 组件"
```

---

## Task 3: 创建 BlogFilterBar 组件

**Files:**
- Create: `components/blog/blog-filter-bar.tsx`

**Step 1: 创建 BlogFilterBar 组件**

```tsx
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
      params.set("sortBy", sortBy);
      params.set("order", order);
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
```

**Step 2: 验证组件**

运行: `pnpm build`
预期: 构建成功，无类型错误

**Step 3: 提交**

```bash
git add components/blog/blog-filter-bar.tsx
git commit -m "feat(blog): 创建 BlogFilterBar 筛选组件"
```

---

## Task 4: 创建 BlogList 组件

**Files:**
- Create: `components/blog/blog-list.tsx`

**Step 1: 创建 BlogList 组件**

```tsx
import type { Blog } from "@/types/blog";
import { BlogCard } from "./blog-card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { FileText } from "lucide-react";

interface BlogListProps {
  blogs: Blog[];
  total: number;
  currentPage: number;
  pageSize: number;
  baseUrl: string;
}

export function BlogList({
  blogs,
  total,
  currentPage,
  pageSize,
  baseUrl,
}: BlogListProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (blogs.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileText />
          </EmptyMedia>
          <EmptyTitle>暂无博客</EmptyTitle>
          <EmptyDescription>
            没有找到符合条件的博客文章
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const getPageUrl = (page: number) => {
    const url = new URL(baseUrl, "http://localhost");
    url.searchParams.set("page", page.toString());
    return `/blog?${url.searchParams.toString()}`;
  };

  const getVisiblePages = () => {
    const pages: (number | "ellipsis")[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="space-y-6">
      {/* 博客列表 */}
      <div className="space-y-4">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4">
          <span className="text-sm text-text-secondary">
            共 {total} 篇博客
          </span>
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious href={getPageUrl(currentPage - 1)} />
                </PaginationItem>
              )}

              {getVisiblePages().map((page, index) => (
                <PaginationItem key={index}>
                  {page === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href={getPageUrl(page)}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext href={getPageUrl(currentPage + 1)} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
```

**Step 2: 验证组件**

运行: `pnpm build`
预期: 构建成功，无类型错误

**Step 3: 提交**

```bash
git add components/blog/blog-list.tsx
git commit -m "feat(blog): 创建 BlogList 列表组件"
```

---

## Task 5: 创建博客列表页

**Files:**
- Create: `app/(site)/blog/page.tsx`

**Step 1: 创建博客列表页**

```tsx
import { Suspense } from "react";
import { getBlogsAction } from "@/app/actions/blog";
import { getCategoriesAction } from "@/app/actions/category";
import { getTagsAction } from "@/app/actions/tag";
import { BlogFilterBar } from "@/components/blog/blog-filter-bar";
import { BlogList } from "@/components/blog/blog-list";
import { Title } from "@/components/ui/typography/title";
import { Text } from "@/components/ui/typography/text";
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

async function BlogListContent({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const pageSize = parseInt(params.pageSize || String(DEFAULT_PAGE_SIZE), 10);

  // 并行获取数据
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
    getCategoriesAction({}),
    getTagsAction({}),
  ]);

  if (!blogsResult.success || !categoriesResult.success || !tagsResult.success) {
    throw new Error("获取数据失败");
  }

  const blogs = blogsResult.data;
  const categories = categoriesResult.data.lists || [];
  const tags = tagsResult.data.lists || [];

  // 构建基础 URL 用于分页
  const baseUrl = `/blog?title=${params.title || ""}&categoryId=${params.categoryId || ""}&tagId=${params.tagId || ""}&sortBy=${params.sortBy || "createdAt"}&order=${params.order || "desc"}`;

  return (
    <>
      <BlogFilterBar
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
      <BlogList
        blogs={blogs.lists || []}
        total={blogs.total}
        currentPage={page}
        pageSize={pageSize}
        baseUrl={baseUrl}
      />
    </>
  );
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* 页面标题 */}
      <div className="mb-8">
        <Title level={1}>博客</Title>
        <Text type="secondary" className="mt-2">
          探索技术文章与学习笔记
        </Text>
      </div>

      {/* 内容区 */}
      <Suspense
        fallback={
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-text-secondary" />
          </div>
        }
      >
        <BlogListContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
```

**Step 2: 验证页面**

运行: `pnpm build`
预期: 构建成功，无类型错误

**Step 3: 提交**

```bash
git add app/\(site\)/blog/page.tsx
git commit -m "feat(blog): 创建博客列表页"
```

---

## Task 6: 创建博客详情页

**Files:**
- Create: `app/(site)/blog/[slug]/page.tsx`

**Step 1: 创建博客详情页**

```tsx
import { notFound } from "next/navigation";
import { getBlogBySlugAction } from "@/app/actions/blog";
import BlogContent from "@/components/blog/blog-content";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { Badge } from "@/components/ui/badge";
import { Title } from "@/components/ui/typography/title";
import { Text } from "@/components/ui/typography/text";
import { formatSimpleDate } from "@/lib/time";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

// 生成 SEO 元数据
export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getBlogBySlugAction(slug);

  if (!result.success || !result.data) {
    return {
      title: "博客未找到",
    };
  }

  const blog = result.data;

  return {
    title: blog.title,
    description: blog.description,
    openGraph: {
      title: blog.title,
      description: blog.description,
      type: "article",
      publishedTime: blog.createdAt,
      modifiedTime: blog.updatedAt,
      images: blog.cover ? [blog.cover] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const result = await getBlogBySlugAction(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const blog = result.data;

  // 计算阅读时间（假设每分钟阅读 300 字）
  const readingTime = Math.max(1, Math.ceil(blog.content.length / 300));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* 返回链接 */}
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-accent"
      >
        ← 返回博客列表
      </Link>

      <div className="flex gap-8">
        {/* 主内容区 */}
        <article className="min-w-0 flex-1">
          {/* 封面图 */}
          {blog.cover && (
            <div className="mb-8 aspect-video w-full overflow-hidden rounded-xl">
              <Image
                src={blog.cover}
                alt={blog.title}
                width={1200}
                height={630}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          )}

          {/* 文章头部 */}
          <header className="mb-8">
            <Title level={1} className="mb-4">
              {blog.title}
            </Title>

            <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
              <time>{formatSimpleDate(new Date(blog.createdAt))}</time>
              <span>·</span>
              {blog.category && (
                <>
                  <Badge variant="secondary">{blog.category.name}</Badge>
                  <span>·</span>
                </>
              )}
              <span>{readingTime} 分钟阅读</span>
            </div>
          </header>

          {/* 分隔线 */}
          <div className="mb-8 h-px bg-border" />

          {/* 文章内容 */}
          <BlogContent content={blog.content} />

          {/* 标签 */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <Badge key={tag.id} variant="outline">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </article>

        {/* 右侧目录（桌面端显示） */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <TableOfContents />
        </aside>
      </div>
    </div>
  );
}
```

**Step 2: 验证页面**

运行: `pnpm build`
预期: 构建成功，无类型错误

**Step 3: 提交**

```bash
git add app/\(site\)/blog/\[slug\]/page.tsx
git commit -m "feat(blog): 创建博客详情页"
```

---

## Task 7: 最终验证和集成测试

**Step 1: 运行构建**

```bash
pnpm build
```

预期: 构建成功，无错误

**Step 2: 运行开发服务器**

```bash
pnpm dev
```

访问以下页面验证功能：
- `/blog` - 博客列表页
- `/blog?title=test` - 标题搜索
- `/blog?categoryId=xxx` - 分类筛选
- `/blog?tagId=xxx` - 标签筛选
- `/blog?sortBy=updatedAt&order=desc` - 排序
- `/blog/[slug]` - 博客详情页

**Step 3: 最终提交**

```bash
git add -A
git commit -m "feat(blog): 完成博客列表页和详情页实现"
```

---

## 文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `stores/blog/store.ts` | 修改 | 添加 sortBy/order 支持 |
| `components/blog/blog-card.tsx` | 新建 | 博客卡片组件 |
| `components/blog/blog-filter-bar.tsx` | 新建 | 筛选工具栏 |
| `components/blog/blog-list.tsx` | 新建 | 博客列表容器 |
| `app/(site)/blog/page.tsx` | 新建 | 博客列表页 |
| `app/(site)/blog/[slug]/page.tsx` | 新建 | 博客详情页 |
