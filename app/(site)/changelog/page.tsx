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
import BlogContent from "@/components/blog/blog-content";
import { formatSimpleDate } from "@/lib/time";

const PAGE_SIZE = 10;

const fetcher = async (params: ChangelogListReq): Promise<ChangelogListResp> => {
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
    <div className="relative flex gap-6">
      {/* Timeline column */}
      <div className="relative flex flex-col items-center" style={{ width: "20px", flexShrink: 0 }}>
        {/* Circle dot */}
        <div
          className="relative z-10 mt-1"
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            background: isCurrent ? "var(--primary)" : "var(--background-elevated)",
            border: isCurrent ? "none" : "2px solid var(--border)",
            boxShadow: isCurrent ? "0 0 10px var(--primary)" : "none",
            flexShrink: 0,
          }}
        />
        {/* Vertical line */}
        {!isLast && (
          <div
            className="mt-2 flex-1"
            style={{
              width: "2px",
              background: "var(--border-subtle)",
              minHeight: "2rem",
            }}
          />
        )}
      </div>

      {/* Content */}
      <div
        className="group flex-1 pb-10"
        style={{ minWidth: 0 }}
      >
        {/* Version badge + date */}
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              background: "var(--tag-bg)",
              color: "var(--tag-fg)",
              border: "1px solid var(--tag-border)",
              borderRadius: "0.375rem",
              padding: "0.2rem 0.6rem",
              fontWeight: 500,
            }}
          >
            {changelog.version}
          </span>
          <time
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              color: "var(--foreground-subtle)",
            }}
          >
            {formatSimpleDate(displayDate)}
          </time>
        </div>

        {/* Changelog card */}
        <div
          className="rounded-[0.5rem] p-5 transition-all duration-300"
          style={{
            background: "var(--background-subtle)",
            border: "1px solid var(--border)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = "translateX(4px)";
            (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-hover)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = "translateX(0)";
            (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
          }}
        >
          <div style={{ color: "var(--foreground-muted)", fontSize: "0.9rem" }}>
            <BlogContent content={changelog.content} />
          </div>
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
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* Hero */}
      <div className={`
        relative py-20
        md:py-28
      `}>
        {/* Background glow */}
        <div
          className={`
            pointer-events-none absolute -top-20 left-1/2 h-[300px] w-[500px] -translate-x-1/2 rounded-full blur-3xl
          `}
          style={{ background: "var(--primary-glow)" }}
        />

        <div className="relative text-center">
          {/* Eyebrow */}
          <div
            className="mb-4"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              color: "var(--foreground-subtle)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
            }}
          >
            CHANGELOG
          </div>

          {/* Title */}
          <h1
            className="mb-4 font-bold"
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              color: "var(--foreground)",
            }}
          >
            更新记录
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "1rem",
              color: "var(--foreground-muted)",
            }}
          >
            记录产品的每一次迭代与改进
          </p>
        </div>
      </div>

      {/* Timeline content */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2
            className="h-8 w-8 animate-spin"
            style={{ color: "var(--foreground-muted)" }}
          />
        </div>
      ) : error ? (
        <div className="flex h-48 items-center justify-center">
          <span style={{ fontSize: "0.875rem", color: "var(--destructive)" }}>
            加载失败，请稍后重试
          </span>
        </div>
      ) : isEmpty ? (
        <div className="flex h-48 items-center justify-center">
          <span style={{ fontSize: "0.875rem", color: "var(--foreground-muted)" }}>
            暂无更新日志
          </span>
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

          {/* Load more indicator */}
          <div ref={loaderRef} className="flex justify-center py-4">
            {isValidating && (
              <Loader2
                className="h-6 w-6 animate-spin"
                style={{ color: "var(--foreground-muted)" }}
              />
            )}
            {!hasMore && changelogs.length > 0 && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  color: "var(--foreground-subtle)",
                }}
              >
                已加载全部
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
