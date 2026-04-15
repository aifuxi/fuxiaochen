import Link from "next/link";

import type { PublicArticleListItemDto } from "@/lib/public/public-content-dto";

export function ArticleRow({ article }: { article: PublicArticleListItemDto }) {
  return (
    <Link
      className={`
        group block border-b
        border-[color:var(--color-line-subtle)]
        py-6 transition-colors duration-300
        hover:bg-white/[0.02]
      `}
      href={`/article/${article.slug}`}
    >
      <div className={`
        grid gap-4
        lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start
      `}>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-[11px] tracking-[0.18em] text-muted uppercase">
            <span className="text-primary">{article.category?.name ?? "未分类"}</span>
            <span aria-hidden="true" className="text-muted-soft">
              /
            </span>
            <span>{formatArticleDate(article.publishedAt)}</span>
            <span aria-hidden="true" className="text-muted-soft">
              /
            </span>
            <span>{article.readTimeLabel}</span>
          </div>
          <h3 className="font-serif text-2xl leading-tight tracking-[-0.04em] text-foreground">
            {article.title}
          </h3>
          <p className="max-w-3xl text-sm leading-7 text-muted">{article.excerpt}</p>
        </div>
        <div className={`
          font-mono-tech text-[11px] tracking-[0.18em] text-muted uppercase
          lg:justify-self-end
        `}>
          继续阅读 →
        </div>
      </div>
    </Link>
  );
}

function formatArticleDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
