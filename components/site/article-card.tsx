import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function ArticleCard({
  href,
  category,
  title,
  excerpt,
  meta,
}: {
  href: string;
  category: string;
  title: string;
  excerpt: string;
  meta: string;
}) {
  return (
    <Card className={`
      group h-full transition-transform duration-[var(--duration-slow)]
      hover:-translate-y-1
    `}>
      <CardContent className="space-y-5 p-0">
        <Badge variant="primary">{category}</Badge>
        <div className="space-y-3">
          <h3 className="font-serif text-3xl font-semibold tracking-[-0.04em]">
            {title}
          </h3>
          <p className="text-sm leading-7 text-muted">{excerpt}</p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
            {meta}
          </span>
          <Link
            href={href}
            className={`
              inline-flex items-center gap-2 text-sm text-primary transition-transform
              hover:translate-x-1
            `}
          >
            Read
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
