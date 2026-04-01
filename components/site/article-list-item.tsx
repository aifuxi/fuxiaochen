import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ArticleListItem({
  href,
  category,
  title,
  excerpt,
  date,
  readTime,
  image,
}: {
  href: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
}) {
  return (
    <article className={`
      group grid gap-5 rounded-[1.5rem] border border-white/10 bg-card p-4 transition-colors duration-300
      hover:bg-[rgb(255_255_255_/_0.03)]
      md:grid-cols-[160px_1fr_auto] md:items-center
    `}>
      <div className="overflow-hidden rounded-[1rem]">
        <img
          alt={title}
          className={`
            h-28 w-full object-cover transition-transform duration-[600ms] ease-[var(--ease-smooth)]
            group-hover:scale-105
            md:h-32
          `}
          src={image}
        />
      </div>
      <div className="space-y-2">
        <div className="font-mono text-[11px] tracking-[0.16em] text-primary uppercase">
          {category}
        </div>
        <h3 className="font-serif text-[1.75rem] leading-[1.04] font-medium tracking-[-0.04em] text-fg">
          {title}
        </h3>
        <p className="text-sm leading-7 text-muted">{excerpt}</p>
        <div className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">
          {date} • {readTime}
        </div>
      </div>
      <Link
        href={href}
        className={`
          inline-flex size-12 items-center justify-center rounded-full border border-white/10 text-muted transition-all
          hover:translate-x-1 hover:border-primary hover:text-primary
        `}
      >
        <ArrowRight className="size-4" />
      </Link>
    </article>
  );
}
