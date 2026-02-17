"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import useSWR from "swr";
import { getChangelogsAction } from "@/app/actions/changelog";
import type { ChangelogListReq } from "@/types/changelog";
import { Card } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Text } from "@/components/ui/typography/text";
import { Title } from "@/components/ui/typography/title";
import BlogContent from "@/components/blog/blog-content";
import { formatSimpleDate } from "@/lib/time";

const PAGE_SIZE = 10;

const fetcher = async (params: ChangelogListReq) => {
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

function generatePaginationPages(
  currentPage: number,
  totalPages: number,
): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      "ellipsis",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
}

export default function ChangelogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const { data, error, isLoading } = useSWR(
    { page, pageSize: PAGE_SIZE },
    fetcher,
  );

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;
  const paginationPages = generatePaginationPages(page, totalPages);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    router.push(`/changelog?${params.toString()}`);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
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
      ) : !data?.lists?.length ? (
        <Card className="flex h-48 items-center justify-center">
          <Text className="text-text-secondary">暂无更新日志</Text>
        </Card>
      ) : (
        <>
          <div className="relative">
            {/* 背景装饰 */}
            <div
              aria-hidden="true"
              className={`
                pointer-events-none absolute top-0 -left-20 h-[500px] w-[500px] rounded-full bg-accent/5 blur-3xl
              `}
            />

            <div className="relative ml-32">
              {/* 竖直时间线 */}
              <div
                aria-hidden="true"
                className={`
                  absolute top-4 bottom-4 left-0 z-10 w-0.5 rounded-full bg-gradient-to-b from-accent via-accent/50
                  to-transparent
                `}
              />

              <div className="space-y-12">
                {data.lists.map((changelog, index) => (
                  <div key={changelog.id} className="relative">
                    {/* 超大版本号背景 */}
                    <div
                      aria-hidden="true"
                      className={`
                        pointer-events-none absolute -top-8 -left-36 z-0 font-mono text-8xl font-black tracking-tighter
                        select-none
                        ${index === 0 ? "text-accent/10" : "text-border"}
                      `}
                    >
                      {changelog.version.replace("v", "")}
                    </div>

                    {/* 最新标签 */}
                    {index === 0 && (
                      <div className={`
                        relative z-20 mb-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs
                        font-medium text-white
                      `}>
                        <Sparkles className="size-3" />
                        最新版本
                      </div>
                    )}

                    {/* 时间线节点 */}
                    <div
                      aria-hidden="true"
                      className={`
                        absolute top-4 left-0 z-20 size-4 -translate-x-1/2 rounded-full border-4
                        ${index === 0 ? "border-accent bg-accent/20" : "border-accent/40 bg-surface"}
                      `}
                    />

                    {/* 卡片 */}
                    <div
                      className={`
                        group relative ml-6 overflow-hidden rounded-2xl border bg-surface/80 p-6 backdrop-blur-sm
                        transition-all duration-300
                        ${index === 0 ? "border-accent/30 shadow-xl shadow-accent/10" : `
                          border-border
                          hover:border-accent/20
                        `}
                      `}
                    >
                      {/* 最新版本渐变边框 */}
                      {index === 0 && (
                        <div
                          aria-hidden="true"
                          className={`
                            absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/20 via-transparent to-accent/20
                            opacity-50
                          `}
                        />
                      )}

                      {/* 顶部信息 */}
                      <div className="relative mb-4 flex items-center gap-4">
                        <h3
                          className={`
                            bg-gradient-to-r bg-clip-text text-2xl font-bold
                            ${index === 0 ? "from-accent to-accent/70 text-transparent" : `
                              from-text to-text-secondary text-transparent
                            `}
                          `}
                        >
                          {changelog.version}
                        </h3>
                        <div
                          className={`
                            h-6 w-px
                            ${index === 0 ? "bg-accent/30" : "bg-border"}
                          `}
                        />
                        <time
                          className={`
                            text-sm font-medium
                            ${index === 0 ? "text-accent" : "text-text-tertiary"}
                          `}
                        >
                          {getDisplayDate(changelog)}
                        </time>
                      </div>

                      {/* 内容 */}
                      <div className="relative text-text-secondary">
                        <BlogContent content={changelog.content} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                {page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page - 1);
                      }}
                    />
                  </PaginationItem>
                )}

                {paginationPages.map((p, index) =>
                  p === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={p === page}
                        onClick={(e) => {
                          e.preventDefault();
                          if (p !== page) {
                            handlePageChange(p);
                          }
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                {page < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page + 1);
                      }}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
