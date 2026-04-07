import Image from "next/image";
import Link from "next/link";

import type { Article } from "@/lib/mocks/site-content";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link className="article-card glass-card shimmer-border spotlight-card block overflow-hidden" href={`/article/${article.slug}`}>
      <div className="overflow-hidden">
        <Image alt={article.title} className="card-image h-48 w-full object-cover" height={400} src={article.image} width={600} />
      </div>
      <div className="relative z-10 p-6">
        <span className="font-mono-tech text-primary-accent text-xs tracking-widest uppercase">{article.category}</span>
        <h3 className="mt-2 mb-3 font-serif text-xl">{article.title}</h3>
        <p className="mb-4 text-sm leading-relaxed font-light text-muted">{article.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{article.date}</span>
          <span>{article.readTime}</span>
        </div>
      </div>
    </Link>
  );
}
