# 更新日志页面 Apple 设计重构实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将更新日志页面重构为 Apple 产品时间线风格

**Architecture:** 保持现有的 useSWRInfinite 数据获取和 IntersectionObserver 无限滚动逻辑，重构 UI 为左侧时间轴布局

**Tech Stack:** React, Tailwind CSS, useSWR Infinite, Lucide Icons

---

## Task 1: 重构页面标题区

**Files:**
- Modify: `app/(site)/changelog/page.tsx`

**Step 1: 重构标题区为 Apple 大胆风格**

将现有的简单标题区替换为居中大气的 Apple 风格标题：

```tsx
// 替换原来的标题区（约 112-118 行）
<div className="py-16 text-center md:py-24">
  <h1 className="text-4xl font-bold tracking-tight text-text md:text-5xl">
    Changelog
  </h1>
  <p className="mt-2 text-lg text-text-secondary">
    记录产品的每一次迭代与改进
  </p>
</div>
```

**Step 2: 验证页面正常运行**

Run: `pnpm dev`

访问 http://localhost:3000/changelog 确认标题区显示正确。

---

## Task 2: 创建时间轴条目组件

**Files:**
- Modify: `app/(site)/changelog/page.tsx`

**Step 1: 添加年份判断辅助函数**

在 `getDisplayDate` 函数后添加：

```tsx
function isCurrentYear(date: Date): boolean {
  return date.getFullYear() === new Date().getFullYear();
}
```

**Step 2: 重构 ChangelogCard 为时间轴样式**

替换整个 `ChangelogCard` 组件（约 38-66 行）：

```tsx
function ChangelogItem({
  changelog,
  isLast,
}: {
  changelog: Changelog;
  isLast: boolean;
}) {
  const displayDate = changelog.date
    ? new Date(changelog.date)
    : new Date(changelog.createdAt);
  const isCurrent = isCurrentYear(displayDate);

  return (
    <div className="relative">
      {/* 时间轴线 */}
      {!isLast && (
        <div className="absolute bottom-0 left-4 top-8 w-px bg-border md:left-6" />
      )}

      {/* 圆点 */}
      <div
        className={`
          absolute left-4 top-1.5 flex items-center justify-center md:left-6
        `}
      >
        {isCurrent ? (
          <div className="h-3 w-3 rounded-full bg-accent ring-4 ring-accent/20" />
        ) : (
          <div className="h-2.5 w-2.5 rounded-full border border-border bg-surface-hover" />
        )}
      </div>

      {/* 内容 */}
      <div className="pb-12 pl-10 md:pl-14">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-lg font-semibold text-text">
            {changelog.version}
          </span>
          <span className="text-text-tertiary">—</span>
          <time className="text-sm text-text-tertiary">
            {formatSimpleDate(displayDate)}
          </time>
        </div>
        <div className="text-text-secondary">
          <BlogContent content={changelog.content} />
        </div>
      </div>
    </div>
  );
}
```

**Step 3: 移除未使用的 Badge 导入**

从导入语句中移除 `Badge`：
```tsx
// 移除这一行中的 Badge
import { Badge } from "@/components/ui/badge";
```

**Step 4: 验证组件编译通过**

Run: `pnpm lint`

确保没有 TypeScript 错误。

---

## Task 3: 重构列表容器

**Files:**
- Modify: `app/(site)/changelog/page.tsx`

**Step 1: 更新列表渲染逻辑**

替换 changelogs.map 渲染部分（约 133-140 行）：

```tsx
<div className="relative">
  {changelogs.map((changelog, index) => (
    <ChangelogItem
      key={changelog.id}
      changelog={changelog}
      isLast={index === changelogs.length - 1}
    />
  ))}

  {/* 加载更多指示器 */}
  <div ref={loaderRef} className="flex justify-center py-4">
    {isValidating && (
      <Loader2 className="h-6 w-6 animate-spin text-text-secondary" />
    )}
    {!hasMore && changelogs.length > 0 && (
      <Text className="text-text-tertiary">已加载全部</Text>
    )}
  </div>
</div>
```

**Step 2: 移除未使用的 Card 导入（如果空状态也需要调整）**

保持空状态和错误状态使用 Card 即可。

---

## Task 4: 调整空状态和错误状态样式

**Files:**
- Modify: `app/(site)/changelog/page.tsx`

**Step 1: 统一空状态和错误状态样式**

替换加载、错误、空状态的渲染（约 120-131 行）：

```tsx
{isLoading ? (
  <div className="flex h-48 items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-text-secondary" />
  </div>
) : error ? (
  <div className="flex h-48 items-center justify-center">
    <Text className="text-error">加载失败，请稍后重试</Text>
  </div>
) : isEmpty ? (
  <div className="flex h-48 items-center justify-center">
    <Text className="text-text-secondary">暂无更新日志</Text>
  </div>
) : (
  // ... 时间轴列表
)}
```

---

## Task 5: 最终验证与提交

**Step 1: 完整功能测试**

Run: `pnpm dev`

检查清单：
- [ ] 标题区居中显示，样式正确
- [ ] 时间轴线贯穿所有条目
- [ ] 当前年份的圆点有 accent 高亮
- [ ] 往年圆点为灰色描边样式
- [ ] 滚动到底部触发加载更多
- [ ] 空状态显示正确
- [ ] 暗色模式下样式正确

**Step 2: 代码检查**

Run: `pnpm lint:fix && pnpm build`

确保无 lint 错误，构建成功。

**Step 3: 提交**

```bash
git add app/\(site\)/changelog/page.tsx
git commit -m "$(cat <<'EOF'
refactor(changelog): 重构为 Apple 时间线风格

- 重构标题区为居中 Apple 大胆风格
- 添加左侧垂直时间轴和圆点指示器
- 当前年份圆点使用 accent 高亮
- 移除最新标签，通过时间轴位置体现顺序
- 保持无限滚动加载功能

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## 完整代码参考

最终 `app/(site)/changelog/page.tsx` 完整代码：

```tsx
"use client";

import { useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";
import useSWRInfinite from "swr/infinite";
import { getChangelogsAction } from "@/app/actions/changelog";
import type {
  ChangelogListReq,
  ChangelogListResp,
  Changelog,
} from "@/types/changelog";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/typography/text";
import BlogContent from "@/components/blog/blog-content";
import { formatSimpleDate } from "@/lib/time";

const PAGE_SIZE = 10;

const fetcher = async (
  params: ChangelogListReq,
): Promise<ChangelogListResp> => {
  const res = await getChangelogsAction(params);
  if (res.success && res.data) {
    return res.data;
  }
  throw new Error(String(res.error) || "获取数据失败");
};

function getDisplayDate(changelog: { date?: number; createdAt: string }) {
  if (changelog.date) {
    return formatSimpleDate(new Date(changelog.date));
  }
  return formatSimpleDate(new Date(changelog.createdAt));
}

function isCurrentYear(date: Date): boolean {
  return date.getFullYear() === new Date().getFullYear();
}

function ChangelogItem({
  changelog,
  isLast,
}: {
  changelog: Changelog;
  isLast: boolean;
}) {
  const displayDate = changelog.date
    ? new Date(changelog.date)
    : new Date(changelog.createdAt);
  const isCurrent = isCurrentYear(displayDate);

  return (
    <div className="relative">
      {/* 时间轴线 */}
      {!isLast && (
        <div className="absolute bottom-0 left-4 top-8 w-px bg-border md:left-6" />
      )}

      {/* 圆点 */}
      <div
        className={`
          absolute left-4 top-1.5 flex items-center justify-center md:left-6
        `}
      >
        {isCurrent ? (
          <div className="h-3 w-3 rounded-full bg-accent ring-4 ring-accent/20" />
        ) : (
          <div className="h-2.5 w-2.5 rounded-full border border-border bg-surface-hover" />
        )}
      </div>

      {/* 内容 */}
      <div className="pb-12 pl-10 md:pl-14">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-lg font-semibold text-text">
            {changelog.version}
          </span>
          <span className="text-text-tertiary">—</span>
          <time className="text-sm text-text-tertiary">
            {formatSimpleDate(displayDate)}
          </time>
        </div>
        <div className="text-text-secondary">
          <BlogContent content={changelog.content} />
        </div>
      </div>
    </div>
  );
}

export default function ChangelogPage() {
  const loaderRef = useRef<HTMLDivElement>(null);

  const getKey = useCallback(
    (pageIndex: number, previousPageData: ChangelogListResp | null) => {
      if (previousPageData && !previousPageData.lists?.length) return null;
      return { page: pageIndex + 1, pageSize: PAGE_SIZE };
    },
    [],
  );

  const { data, error, isLoading, isValidating, size, setSize } =
    useSWRInfinite<ChangelogListResp>(getKey, fetcher, {
      revalidateFirstPage: false,
    });

  const changelogs = data?.flatMap((page) => page.lists ?? []) ?? [];
  const isEmpty = !isLoading && changelogs.length === 0;
  const hasMore = data?.[data.length - 1]?.lists?.length === PAGE_SIZE;

  const loadMore = useCallback(() => {
    if (!isValidating && hasMore) {
      setSize(size + 1);
    }
  }, [isValidating, hasMore, size, setSize]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* 标题区 */}
      <div className="py-16 text-center md:py-24">
        <h1 className="text-4xl font-bold tracking-tight text-text md:text-5xl">
          Changelog
        </h1>
        <p className="mt-2 text-lg text-text-secondary">
          记录产品的每一次迭代与改进
        </p>
      </div>

      {/* 内容区 */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-text-secondary" />
        </div>
      ) : error ? (
        <div className="flex h-48 items-center justify-center">
          <Text className="text-error">加载失败，请稍后重试</Text>
        </div>
      ) : isEmpty ? (
        <div className="flex h-48 items-center justify-center">
          <Text className="text-text-secondary">暂无更新日志</Text>
        </div>
      ) : (
        <div className="relative">
          {changelogs.map((changelog, index) => (
            <ChangelogItem
              key={changelog.id}
              changelog={changelog}
              isLast={index === changelogs.length - 1}
            />
          ))}

          {/* 加载更多指示器 */}
          <div ref={loaderRef} className="flex justify-center py-4">
            {isValidating && (
              <Loader2 className="h-6 w-6 animate-spin text-text-secondary" />
            )}
            {!hasMore && changelogs.length > 0 && (
              <Text className="text-text-tertiary">已加载全部</Text>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```
