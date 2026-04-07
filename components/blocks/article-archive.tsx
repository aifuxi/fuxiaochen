"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { ArticleCard } from "@/components/blocks/article-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Article } from "@/lib/mocks/site-content";

const pageSize = 6;

export function ArticleArchive({ articles }: { articles: Article[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query);

  const categories = useMemo(
    () => [{ label: "All topics", value: "all" }, ...new Set(articles.map((article) => article.category)).values()].map((item) =>
      typeof item === "string" ? { label: item, value: item } : item,
    ),
    [articles],
  );

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

  return (
    <div className="space-y-8">
      <div className={`
        grid gap-4 rounded-[1.8rem] border border-white/8 bg-white/3 p-5
        lg:grid-cols-[1fr_15rem]
      `}>
        <Input placeholder="Search titles, tags, and topics..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select
          options={categories}
          value={category}
          onValueChange={(value) => {
            setCategory(value as string);
            setPage(1);
          }}
        />
        <div className={`
          flex flex-wrap gap-2
          lg:col-span-2
        `}>
          {categories.map((item) => (
            <button
              key={item.value}
              className="cursor-pointer"
              type="button"
              onClick={() => {
                setCategory(item.value);
                setPage(1);
              }}
            >
              <Badge variant={category === item.value ? "primary" : "muted"}>{item.label}</Badge>
            </button>
          ))}
        </div>
      </div>

      <div className={`
        grid gap-5
        lg:grid-cols-2
        xl:grid-cols-3
      `}>
        {pagedArticles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>

      {pagedArticles.length === 0 ? (
        <div className={`
          rounded-[1.8rem] border border-dashed border-white/10 bg-white/2 px-6 py-12 text-center text-sm text-muted
        `}>
          No matching articles in the mock archive.
        </div>
      ) : null}

      <div className="flex items-center justify-between rounded-[1.8rem] border border-white/8 bg-white/3 px-5 py-4">
        <div className="font-mono text-[11px] tracking-[0.28em] text-muted uppercase">
          Page {page} / {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            className={`
              rounded-full border border-white/10 px-4 py-2 text-sm text-muted transition-colors
              hover:bg-white/6 hover:text-foreground
              disabled:opacity-40
            `}
            disabled={page === 1}
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Prev
          </button>
          <button
            className={`
              rounded-full border border-white/10 px-4 py-2 text-sm text-muted transition-colors
              hover:bg-white/6 hover:text-foreground
              disabled:opacity-40
            `}
            disabled={page === totalPages}
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
