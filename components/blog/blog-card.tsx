import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppleCard } from "@/components/ui/glass-card";

interface BlogCardProps {
  title: string;
  excerpt: string;
  tags: string[];
  date: string;
  slug: string;
  cover?: string | null;
}

export function BlogCard({
  title,
  excerpt,
  tags,
  date,
  slug,
  cover,
}: BlogCardProps) {
  return (
    <Link
      href={`/blog/${slug}`}
      className={`
        group block h-full
        focus:outline-none
      `}
    >
      <AppleCard
        variant="hover"
        className={`
          flex h-full flex-col overflow-hidden border border-border bg-surface p-0 shadow-sm
          hover:shadow-md
        `}
      >
        {/* Cover Image */}
        <div className="relative h-48 w-full overflow-hidden bg-surface">
          <Image
            src={cover || "/images/placeholder.avif"}
            alt={title}
            fill
            className={`
              object-cover transition-transform duration-300 ease-apple
              group-hover:scale-105
            `}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-3 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent"
              >
                {tag}
              </span>
            ))}
          </div>

          <h3
            className={`
              mb-2 line-clamp-2 text-xl font-bold tracking-tight text-text transition-colors duration-200
              group-hover:text-accent
            `}
          >
            {title}
          </h3>

          <p className="mb-4 line-clamp-2 text-sm text-text-secondary">
            {excerpt}
          </p>

          <div
            className={`
              mt-auto flex items-center justify-between border-t border-border pt-4 text-xs font-medium
              text-text-tertiary
            `}
          >
            <time className="font-mono">{date}</time>
            <span
              className={`
                flex -translate-x-2 items-center gap-1 text-accent opacity-0 transition-all duration-200
                group-hover:translate-x-0 group-hover:opacity-100
              `}
            >
              Read Post <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </AppleCard>
    </Link>
  );
}
