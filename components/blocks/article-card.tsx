import Image from "next/image";
import Link from "next/link";

import type { PublicArticleListItemDto } from "@/lib/public/public-content-dto";

export function ArticleCard({ article }: { article: PublicArticleListItemDto }) {
  return (
    <Link className="article-card glass-card shimmer-border spotlight-card block overflow-hidden" href={`/article/${article.slug}`}>
      <div className="overflow-hidden">
        {article.coverImageUrl ? (
          <Image
            alt={article.coverImageAlt ?? article.title}
            className="card-image h-48 w-full object-cover"
            height={400}
            src={article.coverImageUrl}
            width={600}
          />
        ) : (
          <div className="card-image flex h-48 w-full items-center justify-center bg-white/5">
            <span className="font-mono-tech text-xs tracking-widest text-muted uppercase">无封面</span>
          </div>
        )}
      </div>
      <div className="relative z-10 p-6">
        <span className="font-mono-tech text-primary-accent text-xs tracking-widest uppercase">
          {article.category?.name ?? "未分类"}
        </span>
        <h3 className="mt-2 mb-3 font-serif text-xl">{article.title}</h3>
        <p className="mb-4 text-sm leading-relaxed font-light text-muted">{article.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{formatArticleDate(article.publishedAt)}</span>
          <span>{article.readTimeLabel}</span>
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
