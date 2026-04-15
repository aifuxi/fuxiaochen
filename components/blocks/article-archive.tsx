"use client";

import { useDeferredValue, useMemo, useState } from "react";
import useSWR from "swr";

import { ArticleCard } from "@/components/blocks/article-card";
import type {
  PublicArticleCategorySummaryDto,
  PublicArticleListItemDto,
  PublicListResult,
} from "@/lib/public/public-content-dto";
import { cn } from "@/lib/utils";

const pageSize = 8;

type ArticleArchiveProps = {
  categories: PublicArticleCategorySummaryDto[];
  initialResult: PublicListResult<PublicArticleListItemDto>;
};

type ArticlesApiResponse = {
  data: {
    items: PublicArticleListItemDto[];
  };
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
};

type PaginationItem = number | "ellipsis";

const activeCategoryPillClass = `
  border-[color:var(--color-line-strong)]
  bg-white/[0.03] text-foreground
`;

const inactiveCategoryPillClass = `
  border-[color:var(--color-line-default)]
  bg-transparent
  hover:border-[color:var(--color-line-strong)] hover:bg-white/[0.02] hover:text-foreground
`;

export function ArticleArchive({ categories, initialResult }: ArticleArchiveProps) {
  const [query, setQuery] = useState("");
  const [categorySlug, setCategorySlug] = useState("all");
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query);
  const requestPath = useMemo(
    () =>
      buildArticlesPath({
        categorySlug: categorySlug === "all" ? undefined : categorySlug,
        keyword: deferredQuery,
        page,
        pageSize,
      }),
    [categorySlug, deferredQuery, page],
  );
  const { data: result = initialResult, error, isLoading, mutate } = useSWR(requestPath, fetchArticles, {
    fallbackData: isInitialRequest(requestPath) ? initialResult : undefined,
    keepPreviousData: true,
  });
  const hasError = Boolean(error);

  const categoryOptions = useMemo(() => [{ name: "全部", slug: "all" }, ...categories], [categories]);
  const totalPages = Math.max(1, result.totalPages);
  const pagedArticles = result.items;
  const paginationItems = useMemo(() => getPaginationItems(page, totalPages), [page, totalPages]);
  const articleCountLabel = `${result.total} article${result.total === 1 ? "" : "s"}`;

  return (
    <div className="space-y-10">
      <div className="site-frame">
        <div className={`
          space-y-6 rounded-[1.75rem] p-6 editorial-panel
          md:p-8
        `}>
          <div className={`
            flex flex-col gap-4
            lg:flex-row lg:items-end lg:justify-between
          `}>
            <div className="space-y-2">
              <div className="font-mono-tech text-[11px] tracking-[0.28em] text-primary uppercase">
                ARTICLE ARCHIVE
              </div>
              <h2 className={`
                font-serif text-3xl tracking-[-0.05em] text-foreground
                lg:text-4xl
              `}>
                文章归档
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-muted">
                用搜索、分类和分页快速定位文章，外壳保持安静，让内容本身成为主角。
              </p>
            </div>
            <div className="font-mono-tech text-[11px] tracking-[0.18em] text-muted uppercase">
              {articleCountLabel}
            </div>
          </div>

          <div className={`
            grid gap-4
            lg:grid-cols-[minmax(0,1fr)_16rem]
          `}>
            <div className="relative">
              <label className="sr-only" htmlFor="article-archive-search">
                搜索文章
              </label>
              <input
                id="article-archive-search"
                className={`
                  search-input w-full rounded-full py-3 pr-4 pl-12 text-foreground
                  placeholder:text-muted
                `}
                placeholder="搜索文章..."
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-muted">⌕</span>
            </div>
            <label className="sr-only" htmlFor="article-archive-category">
              文章分类
            </label>
            <select
              id="article-archive-category"
              className={`
                select-dropdown font-mono-tech rounded-full px-4 py-3 text-[11px] tracking-[0.18em] text-foreground
                uppercase
              `}
              value={categorySlug}
              onChange={(event) => {
                setCategorySlug(event.target.value);
                setPage(1);
              }}
            >
              {categoryOptions.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.slug === "all" ? "全部分类" : item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            {categoryOptions.map((item) => (
              <button
                key={item.slug}
                className={cn(
                  "rounded-full border px-4 py-2 text-[11px] tracking-[0.08em] text-muted transition-colors",
                  categorySlug === item.slug && activeCategoryPillClass,
                  categorySlug !== item.slug && inactiveCategoryPillClass,
                )}
                type="button"
                onClick={() => {
                  setCategorySlug(item.slug);
                  setPage(1);
                }}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="site-frame">
        {hasError ? (
          <div className={`
            space-y-4 rounded-[1.75rem] p-6 editorial-panel
            md:p-8
          `}>
            <div className="space-y-2">
              <h3 className="font-serif text-2xl tracking-[-0.04em] text-foreground">
                文章列表暂时无法加载
              </h3>
              <p className="max-w-2xl text-sm leading-7 text-muted">
                当前筛选条件已更新，但列表请求失败了。请重试后再查看内容，避免看到过时结果。
              </p>
            </div>
            <button className="page-btn px-4" type="button" onClick={() => void mutate()}>
              重试加载
            </button>
          </div>
        ) : (
          <>
            <div
              className={`
                grid gap-8
                md:grid-cols-2
              `}
            >
              {pagedArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>

            {pagedArticles.length === 0 && !isLoading ? (
              <div className="py-20 text-center">
                <h3 className="mb-2 font-serif text-2xl">未找到文章</h3>
                <p className="text-muted">尝试调整搜索或筛选条件</p>
              </div>
            ) : null}

            <div className="flex flex-col items-center gap-6 pt-4">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  className="page-btn px-4"
                  disabled={page === 1}
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  上一页
                </button>
                {paginationItems.map((item, index) =>
                  item === "ellipsis" ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="font-mono-tech px-2 text-[11px] tracking-[0.16em] text-muted uppercase"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      className={cn("page-btn", item === page && "active")}
                      type="button"
                      onClick={() => setPage(item)}
                    >
                      {item}
                    </button>
                  ),
                )}
                <button
                  className="page-btn px-4"
                  disabled={page === totalPages}
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                >
                  下一页
                </button>
              </div>
              <span className="font-mono-tech text-[11px] tracking-[0.16em] text-muted uppercase">
                {pagedArticles.length > 0
                  ? `显示 ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, result.total)}`
                  : "显示 0"}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

async function fetchArticles(path: string): Promise<PublicListResult<PublicArticleListItemDto>> {
  const response = await fetch(path, {
    headers: {
      Accept: "application/json",
    },
  });
  const payload = (await response.json()) as ArticlesApiResponse;

  if (!response.ok || !payload.success) {
    throw new Error("Unable to fetch articles.");
  }

  return {
    items: payload.data.items,
    page: payload.meta?.page ?? 1,
    pageSize: payload.meta?.pageSize ?? pageSize,
    total: payload.meta?.total ?? payload.data.items.length,
    totalPages: payload.meta?.totalPages ?? 1,
  };
}

function buildArticlesPath({
  categorySlug,
  keyword,
  page,
  pageSize,
}: {
  categorySlug?: string;
  keyword: string;
  page: number;
  pageSize: number;
}) {
  const searchParams = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  const normalizedKeyword = keyword.trim();

  if (normalizedKeyword.length > 0) {
    searchParams.set("keyword", normalizedKeyword);
  }

  if (categorySlug) {
    searchParams.set("categorySlug", categorySlug);
  }

  return `/api/public/articles?${searchParams.toString()}`;
}

function isInitialRequest(path: string) {
  return path === `/api/public/articles?page=1&pageSize=${pageSize}`;
}

function getPaginationItems(page: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const clampedItems = Array.from(items).filter((item) => item > 1 && item < totalPages).sort((left, right) => left - right);
  const result: PaginationItem[] = [1];

  if (clampedItems[0] > 2) {
    result.push("ellipsis");
  }

  clampedItems.forEach((item) => {
    if (item > 1 && item < totalPages) {
      result.push(item);
    }
  });

  if (clampedItems[clampedItems.length - 1] < totalPages - 1) {
    result.push("ellipsis");
  }

  result.push(totalPages);

  return result;
}
