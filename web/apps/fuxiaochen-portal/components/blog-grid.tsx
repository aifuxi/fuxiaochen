import Link from "next/link";

import { Calendar04Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Badge } from "@/components/ui/badge";

import { type Blog } from "@/api/blog";
import { PATHS } from "@/constants/path";
import { calculateReadTime, formattedDate } from "@/lib/common";

interface Props {
  blogs: Blog[];
}

export function BlogGrid({ blogs }: Props) {
  return (
    <section>
      <h2 className="mb-8 text-2xl font-bold">最新博客</h2>

      <div
        className={`
          grid gap-6
          md:grid-cols-2
          lg:grid-cols-3
        `}
      >
        {blogs?.map((blog) => (
          <Link
            key={blog.slug}
            href={`${PATHS.BLOG}/${blog.slug}`}
            className="group"
          >
            <article
              className={`
                flex h-full flex-col rounded-lg border border-border bg-card p-6 transition-colors
                hover:border-primary/50
              `}
            >
              <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <HugeiconsIcon
                    icon={Calendar04Icon}
                    className="h-3.5 w-3.5"
                  />
                  {formattedDate(new Date(blog.createdAt))}
                </span>
                <span className="flex items-center gap-1.5">
                  <HugeiconsIcon icon={Clock01Icon} className="h-3.5 w-3.5" />
                  预计阅读 {calculateReadTime(blog.content)} 分钟
                </span>
              </div>

              <h3
                className={`
                  mb-3 text-xl font-bold transition-colors
                  group-hover:text-primary
                `}
              >
                {blog.title}
              </h3>

              <p className="mb-4 flex-grow text-sm leading-relaxed text-muted-foreground">
                {blog.description}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {blog?.tags?.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="font-mono text-xs"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
