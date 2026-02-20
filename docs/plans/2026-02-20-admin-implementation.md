# Admin 后台管理页面 Apple 设计重构实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 app/(admin) 下的所有页面重构为 Apple 大胆风格，列表页面支持显示总数和分页

**Architecture:** 保持现有布局结构，优化样式为 Apple 风格；为所有列表页添加分页组件

**Tech Stack:** React, Next.js, Tailwind CSS, TanStack Table, useSWR

---

## Task 1: 优化布局和侧边栏

**Files:**
- Modify: `app/(admin)/layout.tsx`
- Modify: `app/(admin)/admin-sidebar.tsx`

**Step 1: 优化 layout.tsx 样式**

将主内容区的内边距调整为更宽松：

```tsx
<main className="ml-64 flex-1">
  <div className="p-6 md:p-8">
    <div className="min-h-[calc(100vh-4rem)]">{children}</div>
  </div>
</main>
```

**Step 2: 优化 admin-sidebar.tsx 导航样式**

将导航项的圆角从 `rounded-lg` 改为 `rounded-xl`，优化 hover 效果：

```tsx
<Link
  key={item.href}
  href={item.href}
  className={cn(
    `
      group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
      ease-apple
    `,
    isActive
      ? "bg-accent text-white shadow-sm"
      : `
        text-text-secondary
        hover:bg-surface-hover hover:text-text
      `,
  )}
>
```

**Step 3: 验证构建**

Run: `pnpm build`

**Step 4: 提交**

```bash
git add "app/(admin)/layout.tsx" "app/(admin)/admin-sidebar.tsx"
git commit -m "refactor(admin): 优化布局和侧边栏样式"
```

---

## Task 2: 优化仪表盘页面

**Files:**
- Modify: `app/(admin)/admin/page.tsx`

**Step 1: 优化页面标题样式**

将标题从 `text-2xl` 改为 `text-3xl`：

```tsx
<h1 className="text-3xl font-bold tracking-tight text-text">
  仪表盘
</h1>
```

**Step 2: 优化统计卡片样式**

增加卡片的 hover 效果：

```tsx
<AppleCard
  className={`
    h-full transition-all duration-300
    hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg
  `}
>
```

**Step 3: 验证构建**

Run: `pnpm build`

**Step 4: 提交**

```bash
git add "app/(admin)/admin/page.tsx"
git commit -m "refactor(admin): 优化仪表盘页面样式"
```

---

## Task 3: 重构博客列表页 - 添加分页

**Files:**
- Modify: `app/(admin)/admin/blogs/blog-list.tsx`

**Step 1: 添加 Pagination 组件导入**

```tsx
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
```

**Step 2: 添加分页逻辑**

在组件中添加分页相关的计算和函数：

```tsx
const totalPages = Math.ceil((data?.total || 0) / pageSize);

const getPageUrl = (pageNum: number) => {
  const params = new URLSearchParams(searchParams);
  params.set("page", pageNum.toString());
  return `?${params.toString()}`;
};

const getVisiblePages = () => {
  const pages: (number | "ellipsis")[] = [];
  const showEllipsis = totalPages > 7;

  if (!showEllipsis) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (page <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      pages.push("ellipsis");
      pages.push(totalPages);
    } else if (page >= totalPages - 3) {
      pages.push(1);
      pages.push("ellipsis");
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push("ellipsis");
      for (let i = page - 1; i <= page + 1; i++) {
        pages.push(i);
      }
      pages.push("ellipsis");
      pages.push(totalPages);
    }
  }

  return pages;
};
```

**Step 3: 替换底部总数显示为分页组件**

将原有的：
```tsx
{data && (
  <div className="flex justify-center text-sm text-text-secondary">
    共 {data.total} 条数据
  </div>
)}
```

替换为：
```tsx
{data && data.total > 0 && (
  <div className="flex items-center justify-between">
    <span className="text-sm text-text-secondary">
      共 {data.total} 条
    </span>
    {totalPages > 1 && (
      <Pagination>
        <PaginationContent>
          {page > 1 && (
            <PaginationItem>
              <PaginationPrevious href={getPageUrl(page - 1)} />
            </PaginationItem>
          )}

          {getVisiblePages().map((p, index) => (
            <PaginationItem key={index}>
              {p === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href={getPageUrl(p)}
                  isActive={p === page}
                >
                  {p}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {page < totalPages && (
            <PaginationItem>
              <PaginationNext href={getPageUrl(page + 1)} />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    )}
  </div>
)}
```

**Step 4: 优化页面标题样式**

```tsx
<h1 className="text-3xl font-bold tracking-tight text-text">
  博客管理
</h1>
```

**Step 5: 验证构建**

Run: `pnpm build`

**Step 6: 提交**

```bash
git add "app/(admin)/admin/blogs/blog-list.tsx"
git commit -m "feat(admin): 博客列表页添加分页功能"
```

---

## Task 4: 重构分类列表页 - 添加分页

**Files:**
- Modify: `app/(admin)/admin/categories/category-list.tsx`

**Step 1: 添加 Pagination 组件导入**

同 Task 3。

**Step 2: 添加分页逻辑**

同 Task 3。

**Step 3: 替换底部总数显示为分页组件**

同 Task 3。

**Step 4: 优化页面标题样式**

```tsx
<h1 className="text-3xl font-bold tracking-tight text-text">
  分类管理
</h1>
```

**Step 5: 验证构建**

Run: `pnpm build`

**Step 6: 提交**

```bash
git add "app/(admin)/admin/categories/category-list.tsx"
git commit -m "feat(admin): 分类列表页添加分页功能"
```

---

## Task 5: 重构标签列表页 - 添加分页

**Files:**
- Modify: `app/(admin)/admin/tags/tag-list.tsx`

**Step 1-6: 同 Task 3/4**

标题改为：
```tsx
<h1 className="text-3xl font-bold tracking-tight text-text">
  标签管理
</h1>
```

提交：
```bash
git add "app/(admin)/admin/tags/tag-list.tsx"
git commit -m "feat(admin): 标签列表页添加分页功能"
```

---

## Task 6: 重构用户列表页 - 添加分页

**Files:**
- Modify: `app/(admin)/admin/users/user-list.tsx`

**Step 1-6: 同 Task 3/4**

标题改为：
```tsx
<h1 className="text-3xl font-bold tracking-tight text-text">
  用户管理
</h1>
```

提交：
```bash
git add "app/(admin)/admin/users/user-list.tsx"
git commit -m "feat(admin): 用户列表页添加分页功能"
```

---

## Task 7: 重构更新日志列表页 - 添加分页

**Files:**
- Modify: `app/(admin)/admin/changelogs/changelog-list.tsx`

**Step 1-6: 同 Task 3/4**

标题改为：
```tsx
<h1 className="text-3xl font-bold tracking-tight text-text">
  更新日志管理
</h1>
```

提交：
```bash
git add "app/(admin)/admin/changelogs/changelog-list.tsx"
git commit -m "feat(admin): 更新日志列表页添加分页功能"
```

---

## Task 8: 最终验证

**Step 1: 完整构建验证**

Run: `pnpm lint:fix && pnpm build`

**Step 2: 功能测试**

- [ ] 侧边栏导航正常，样式美观
- [ ] 仪表盘页面显示正常
- [ ] 所有列表页分页功能正常
- [ ] 分页组件显示总条数
- [ ] 页码导航正常工作

**Step 3: 提交（如有遗漏）**

```bash
git add -A
git commit -m "chore(admin): 完善样式细节"
```
