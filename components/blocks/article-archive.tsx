"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { ArticleCard } from "@/components/blocks/article-card";
import { cn } from "@/lib/utils";
import type { Article } from "@/lib/mocks/site-content";

const pageSize = 8;

export function ArticleArchive({ articles }: { articles: Article[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query);

  const categories = useMemo(() => ["all", ...new Set(articles.map((article) => article.category))], [articles]);

  const filteredArticles = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [article.title, article.excerpt, article.description, article.category, ...article.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesCategory = category === "all" || article.category === category;

      return matchesQuery && matchesCategory;
    });
  }, [articles, category, deferredQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / pageSize));
  const pagedArticles = filteredArticles.slice((page - 1) * pageSize, page * pageSize);
  const articleCountLabel = `${filteredArticles.length} article${filteredArticles.length === 1 ? "" : "s"}`;

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
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "All Topics" : item}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          {categories.map((item) => (
            <button
              key={item}
              className={cn(
                "tag-pill font-mono-tech rounded-full px-4 py-2 text-xs tracking-wider uppercase",
                category === item && "active",
              )}
              type="button"
              onClick={() => {
                setCategory(item);
                setPage(1);
              }}
            >
              {item === "all" ? "All" : item}
            </button>
          ))}
        </div>
      </div>

      <div className={`
        grid gap-8
        md:grid-cols-2
      `}>{pagedArticles.map((article) => <ArticleCard key={article.slug} article={article} />)}</div>

      {pagedArticles.length === 0 ? (
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
            ? `Showing ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, filteredArticles.length)} of ${articleCountLabel}`
            : `Showing 0 of ${articleCountLabel}`}
        </span>
      </div>
    </div>
  );
}
