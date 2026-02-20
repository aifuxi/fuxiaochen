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
      {/* 时间轴线 - 从圆点中心向下延伸 */}
      {!isLast && (
        <div
          className={`
            absolute top-3 bottom-0 left-4 w-px bg-border
            md:left-6
          `}
        />
      )}

      {/* 圆点 - 垂直居中于时间轴线起点 */}
      <div
        className={`
          absolute top-3 left-4 flex h-3 w-3 -translate-x-1/2 -translate-y-3 items-center justify-center
          md:left-6
        `}
      >
        {isCurrent ? (
          <div className="h-3 w-3 rounded-full bg-accent ring-4 ring-accent/20" />
        ) : (
          <div className="h-2.5 w-2.5 rounded-full border border-border bg-surface-hover" />
        )}
      </div>

      {/* 内容 */}
      <div
        className={`
          pb-12 pl-10
          md:pl-14
        `}
      >
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
      <div
        className={`
          py-16 text-center
          md:py-24
        `}
      >
        <h1
          className={`
            text-4xl font-bold tracking-tight text-text
            md:text-5xl
          `}
        >
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
