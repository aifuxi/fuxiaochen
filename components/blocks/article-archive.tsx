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
  const { data: result = initialResult, isLoading } = useSWR(requestPath, fetchArticles, {
    fallbackData: isInitialRequest(requestPath) ? initialResult : undefined,
    keepPreviousData: true,
  });

  const categoryOptions = useMemo(() => [{ name: "All", slug: "all" }, ...categories], [categories]);
  const totalPages = Math.max(1, result.totalPages);
  const pagedArticles = result.items;
  const articleCountLabel = `${result.total} article${result.total === 1 ? "" : "s"}`;

  return (
    <div className="space-y-12">
      <div className="spotlight-card glass-card shimmer-border p-6">
        <div className={`
          mb-6 flex flex-col gap-4
          lg:flex-row
        `}>
          <div className="relative flex-1">
            <input
              className={`
                search-input w-full rounded-xl py-3 pr-4 pl-12 text-white
                placeholder:text-muted
              `}
              placeholder="Search articles..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-muted">⌕</span>
          </div>
          <select
            className="select-dropdown font-mono-tech rounded-xl px-4 py-3 text-sm text-white"
            value={categorySlug}
            onChange={(event) => {
              setCategorySlug(event.target.value);
              setPage(1);
            }}
          >
            {categoryOptions.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.slug === "all" ? "All Topics" : item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          {categoryOptions.map((item) => (
            <button
              key={item.slug}
              className={cn(
                "tag-pill font-mono-tech rounded-full px-4 py-2 text-xs tracking-wider uppercase",
                categorySlug === item.slug && "active",
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

      <div className={`
        grid gap-8
        md:grid-cols-2
      `}>{pagedArticles.map((article) => <ArticleCard key={article.slug} article={article} />)}</div>

      {pagedArticles.length === 0 && !isLoading ? (
        <div className="py-20 text-center">
          <h3 className="mb-2 font-serif text-2xl">No articles found</h3>
          <p className="text-muted">Try adjusting your search or filter criteria</p>
        </div>
      ) : null}

      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          <button className="page-btn px-4" disabled={page === 1} type="button" onClick={() => setPage((current) => Math.max(1, current - 1))}>
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
            <button key={item} className={cn("page-btn", item === page && "active")} type="button" onClick={() => setPage(item)}>
              {item}
            </button>
          ))}
          <button className="page-btn px-4" disabled={page === totalPages} type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
            Next
          </button>
        </div>
        <span className="font-mono-tech text-sm text-muted">
          {pagedArticles.length > 0
            ? `Showing ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, result.total)} of ${articleCountLabel}`
            : `Showing 0 of ${articleCountLabel}`}
        </span>
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
