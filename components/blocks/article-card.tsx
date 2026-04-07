import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Article } from "@/lib/mocks/site-content";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link className="group block" href={`/article/${article.slug}`}>
      <Card className={`
        spotlight-border h-full overflow-hidden p-0 transition-transform duration-300
        group-hover:-translate-y-1
      `}>
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            alt={article.title}
            className={`
              h-full w-full object-cover transition-transform duration-500
              group-hover:scale-105
            `}
            height={720}
            src={article.image}
            width={1200}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        </div>
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-4">
            <Badge variant="primary">{article.category}</Badge>
            <ArrowUpRight className={`
              size-4 text-muted transition-colors
              group-hover:text-primary
            `} />
          </div>
          <div className="space-y-3">
            <h3 className="font-serif text-3xl leading-tight tracking-[-0.05em]">{article.title}</h3>
            <p className="text-sm leading-6 text-muted">{article.excerpt}</p>
          </div>
          <div className="font-mono text-[11px] tracking-[0.28em] text-muted uppercase">
            {article.date} · {article.readTime}
          </div>
        </div>
      </Card>
    </Link>
  );
}
