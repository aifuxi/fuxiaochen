import Image from "next/image";
import Link from "next/link";

import type { Article } from "@/lib/mocks/site-content";

export function ArticleRow({ article }: { article: Article }) {
  return (
    <Link className={`
      group -mx-6 block rounded-xl border-b border-white/5 px-6 py-8 transition-all duration-300
      hover:bg-white/5
    `} href={`/article/${article.slug}`}>
      <div className="flex items-start gap-6">
        <Image alt={article.title} className="h-[72px] w-24 rounded-xl object-cover" height={150} src={article.image} width={200} />
        <div className="min-w-0 flex-1">
          <h3 className={`
            group-hover:text-primary-accent
            mb-2 font-serif text-xl transition-colors duration-300
          `}>{article.title}</h3>
          <p className="mb-3 text-sm leading-relaxed font-light text-muted">{article.excerpt}</p>
          <div className="flex items-center gap-4 text-xs text-muted">
            <span>{article.date}</span>
            <span>•</span>
            <span>{article.readTime}</span>
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
