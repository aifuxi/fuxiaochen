# Changelog 页面重构实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 重构前台 changelog 页面为简洁的卡片列表布局，支持无限滚动加载

**Architecture:** 使用 SWR 的 `useSWRInfinite` 实现无限滚动，简化卡片设计符合 Apple HIG 规范

**Tech Stack:** Next.js, SWR, React, Tailwind CSS

---

### Task 1: 重构 Changelog 页面组件

**Files:**
- Modify: `app/(site)/changelog/page.tsx`

**Step 1: 重写页面组件**

完整替换 `app/(site)/changelog/page.tsx`：

```tsx
"use client";

import { useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";
import useSWRInfinite from "swr/infinite";
import { getChangelogsAction } from "@/app/actions/changelog";
import type { ChangelogListReq, ChangelogListResp, Changelog } from "@/types/changelog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/typography/text";
import { Title } from "@/components/ui/typography/title";
import BlogContent from "@/components/blog/blog-content";
import { formatSimpleDate } from "@/lib/time";

const PAGE_SIZE = 10;

const fetcher = async (params: ChangelogListReq): Promise<ChangelogListResp> => {
  const res = await getChangelogsAction(params);
  if (res.success) {
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

function ChangelogCard({
  changelog,
  isFirst,
}: {
  changelog: Changelog;
  isFirst: boolean;
}) {
  return (
    <Card className="relative overflow-hidden p-6">
      {isFirst && (
        <Badge className="absolute right-4 top-4" variant="default">
          最新
        </Badge>
      )}
      <div className="mb-4 flex items-center gap-3">
        <Text className="text-lg font-semibold text-text">
          {changelog.version}
        </Text>
        <span className="text-text-tertiary">·</span>
        <time className="text-sm text-text-secondary">
          {getDisplayDate(changelog)}
        </time>
      </div>
      <div className="text-text-secondary">
        <BlogContent content={changelog.content} />
      </div>
    </Card>
  );
}

export default function ChangelogPage() {
  const loaderRef = useRef<HTMLDivElement>(null);

  const getKey = useCallback(
    (pageIndex: number, previousPageData: ChangelogListResp | null) => {
      if (previousPageData && !previousPageData.lists?.length) return null;
      return { page: pageIndex + 1, pageSize: PAGE_SIZE };
    },
    []
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
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <Title level={1}>更新日志</Title>
        <Text className="mt-2 text-text-secondary">
          记录产品的每一次迭代与改进
        </Text>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-text-secondary" />
        </div>
      ) : error ? (
        <Card className="flex h-48 items-center justify-center">
          <Text className="text-error">加载失败，请稍后重试</Text>
        </Card>
      ) : isEmpty ? (
        <Card className="flex h-48 items-center justify-center">
          <Text className="text-text-secondary">暂无更新日志</Text>
        </Card>
      ) : (
        <div className="space-y-4">
          {changelogs.map((changelog, index) => (
            <ChangelogCard
              key={changelog.id}
              changelog={changelog}
              isFirst={index === 0}
            />
          ))}

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

**Step 2: 运行开发服务器验证**

Run: `pnpm dev`
访问: `http://localhost:3000/changelog`
Expected: 页面正常显示，卡片布局简洁，滚动到底部自动加载更多

**Step 3: 验证功能**

- [x] 页面加载显示 10 条日志
- [x] 滚动到底部自动加载更多
- [x] 第一张卡片显示「最新」徽章
- [x] 无更多数据时显示「已加载全部」
- [x] 加载失败显示错误提示
- [x] 空数据时显示「暂无更新日志」

**Step 4: 提交**

```bash
git add app/(site)/changelog/page.tsx
git commit -m "refactor(changelog): 简化页面布局，实现无限滚动

- 移除复杂的时间线装饰元素
- 使用简洁的卡片列表布局
- 使用 useSWRInfinite 实现无限滚动
- 符合 Apple Human Interface Guidelines

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## 完成标准

- [ ] 页面布局简洁清晰，符合 Apple HIG
- [ ] 无限滚动正常工作
- [ ] 所有状态（加载中、错误、空、已加载全部）正确显示
- [ ] 代码已提交
