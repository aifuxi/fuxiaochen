import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ArticleCard({
  href,
  category,
  title,
  excerpt,
  date,
  readTime,
  image,
  compact = false,
}: {
  href: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
  compact?: boolean;
}) {
  return (
    <article
      className={cn(
        `
          spotlight-card shimmer-border group overflow-hidden rounded-[1.5rem] border border-white/10 bg-card
          transition-all duration-[400ms] ease-[var(--ease-smooth)]
          hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0_0_0_/_0.4)]
        `,
        compact && `
          grid grid-cols-[160px_1fr] gap-5 p-0
          hover:-translate-y-1
        `,
      )}
    >
      <div className={cn("relative overflow-hidden", compact ? "m-4 rounded-[1rem]" : "aspect-[16/11]")}>
        <img
          alt={title}
          className={`
            h-full w-full object-cover transition-transform duration-[600ms] ease-[var(--ease-smooth)]
            group-hover:scale-105
          `}
          src={image}
        />
      </div>
      <div className={cn("relative z-10 space-y-5", compact ? "py-5 pr-5" : "p-6")}>
        <div className={`
          inline-flex rounded-full bg-primary/12 px-3 py-1 font-mono text-[11px] tracking-[0.18em] text-primary
          uppercase
        `}>
          {category}
        </div>
        <div className="space-y-3">
          <h3 className={cn("font-serif font-medium tracking-[-0.04em] text-fg", compact ? `
            text-[1.8rem] leading-[1.02]
          ` : `text-[2rem] leading-[1.02]`)}>
            {title}
          </h3>
          <p className="text-sm leading-7 text-muted">{excerpt}</p>
        </div>
        <div className="flex items-center justify-between gap-4 text-muted">
          <span className="font-mono text-[11px] tracking-[0.16em] uppercase">
            {date} • {readTime}
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
      </div>
    </article>
  );
}
