import Image from "next/image";
import Link from "next/link";

import type { PublicArticleListItemDto } from "@/lib/public/public-content-dto";

export function ArticleCard({ article }: { article: PublicArticleListItemDto }) {
  return (
    <Link
      className="block overflow-hidden rounded-[1.75rem] editorial-panel"
      href={`/article/${article.slug}`}
    >
      <div className={`
        border-b
        border-[color:var(--color-line-subtle)]
      `}>
        {article.coverImageUrl ? (
          <Image
            alt={article.coverImageAlt ?? article.title}
            className="h-28 w-full object-cover opacity-90"
            height={400}
            src={article.coverImageUrl}
            width={600}
          />
        ) : (
          <div className="flex h-28 w-full items-center justify-center bg-white/[0.02]">
            <span className="font-mono-tech text-[11px] tracking-[0.22em] text-muted uppercase">无封面</span>
          </div>
        )}
      </div>
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-3 text-[11px] tracking-[0.18em] text-muted uppercase">
          <span className="text-primary">{article.category?.name ?? "未分类"}</span>
          <span aria-hidden="true" className="text-muted-soft">
            /
          </span>
          <span>{formatArticleDate(article.publishedAt)}</span>
        </div>
        <div className="space-y-3">
          <h3 className="font-serif text-2xl leading-tight tracking-[-0.04em] text-foreground">
            {article.title}
          </h3>
          <p className="text-sm leading-7 text-muted">{article.excerpt}</p>
        </div>
        <div className={`
          flex items-center justify-between border-t
          border-[color:var(--color-line-subtle)]
          pt-4 text-xs text-muted
        `}>
          <span className="font-mono-tech tracking-[0.16em] uppercase">{article.readTimeLabel}</span>
          <span className="text-muted">
            阅读 →
          </span>
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
