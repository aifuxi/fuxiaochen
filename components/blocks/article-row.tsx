import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Article } from "@/lib/mocks/site-content";

export function ArticleRow({ article }: { article: Article }) {
  return (
    <Link
      className={`
        group flex flex-col gap-4 rounded-[1.75rem] border border-white/8 bg-white/3 p-5 transition-all
        hover:border-white/12 hover:bg-white/5
        md:flex-row md:items-center md:justify-between
      `}
      href={`/article/${article.slug}`}
    >
      <div className="space-y-3">
        <Badge className="w-fit" variant="muted">
          {article.category}
        </Badge>
        <div>
          <h3 className="font-serif text-3xl tracking-[-0.05em]">{article.title}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{article.excerpt}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="font-mono text-[11px] tracking-[0.28em] text-muted uppercase">
          {article.date} · {article.readTime}
        </div>
        <div className={`
          flex size-12 items-center justify-center rounded-full bg-white/6 transition-colors
          group-hover:bg-primary group-hover:text-primary-foreground
        `}>
          <ArrowRight className="size-4" />
        </div>
      </div>
    </Link>
  );
}
