import Image from "next/image";
import Link from "next/link";

import type { PublicArticleListItemDto } from "@/lib/public/public-content-dto";

export function ArticleRow({ article }: { article: PublicArticleListItemDto }) {
  return (
    <Link className={`
      group -mx-6 block rounded-xl border-b border-white/5 px-6 py-8 transition-all duration-300
      hover:bg-white/5
    `} href={`/article/${article.slug}`}>
      <div className="flex items-start gap-6">
        {article.coverImageUrl ? (
          <Image
            alt={article.coverImageAlt ?? article.title}
            className="h-[72px] w-24 rounded-xl object-cover"
            height={150}
            src={article.coverImageUrl}
            width={200}
          />
        ) : (
          <div className="flex h-[72px] w-24 shrink-0 items-center justify-center rounded-xl bg-white/5">
            <span className="font-mono-tech text-[10px] text-muted uppercase">No Cover</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className={`
            group-hover:text-primary-accent
            mb-2 font-serif text-xl transition-colors duration-300
          `}>{article.title}</h3>
          <p className="mb-3 text-sm leading-relaxed font-light text-muted">{article.excerpt}</p>
          <div className="flex items-center gap-4 text-xs text-muted">
            <span>{formatArticleDate(article.publishedAt)}</span>
            <span>•</span>
            <span>{article.readTimeLabel}</span>
          </div>
        </div>
        <div className={`
          arrow-btn text-muted transition-colors duration-300
          group-hover:text-primary-accent
        `}>→</div>
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
