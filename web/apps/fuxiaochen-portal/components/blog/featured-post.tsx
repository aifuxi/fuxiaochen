import Link from "next/link";

import {
  ArrowUpRight02Icon,
  Calendar04Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Blog } from "fuxiaochen-types";

import { Badge } from "@/components/ui/badge";

import { PATHS } from "@/constants";
import { calculateReadTime, formattedDate } from "@/lib/common";

type Props = {
  blogs: Blog[];
};

export function FeaturedPost({ blogs }: Props) {
  const featuredBlog = blogs[0];

  if (!featuredBlog) {
    return null;
  }

  return (
    <section className="mb-16">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold">精选博客</h2>
        <Badge variant="secondary" className="font-mono text-xs">
          最新
        </Badge>
      </div>

      <Link href={`${PATHS.BLOG}/${featuredBlog.slug}`} className="group block">
        <article className="overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/50">
          <div className="grid gap-8 p-8 md:grid-cols-2">
            <div className="flex flex-col justify-center">
              <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <HugeiconsIcon icon={Calendar04Icon} className="h-4 w-4" />
                  {formattedDate(new Date(featuredBlog.createdAt))}
                </span>
                <span className="flex items-center gap-1.5">
                  <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4" />
                  预计阅读 {calculateReadTime(featuredBlog.content)} 分钟
                </span>
              </div>

              <h3 className="mb-4 text-3xl font-bold transition-colors group-hover:text-primary">
                {featuredBlog.title}
              </h3>

              <p className="mb-6 leading-relaxed text-muted-foreground">
                {featuredBlog.description}
              </p>

              <div className="mb-6 flex flex-wrap items-center gap-3">
                {featuredBlog?.tags?.map((tag) => (
                  <Badge key={tag.id} variant="outline" className="font-mono">
                    {tag.name}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2 font-medium text-primary">
                查看详情
                <HugeiconsIcon
                  icon={ArrowUpRight02Icon}
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-center rounded-lg bg-secondary p-8">
              <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-border bg-muted/30">
                <pre className="font-mono text-xs text-muted-foreground">
                  {`<Component>
  <Component.Header />
  <Component.Body />
  <Component.Footer />
</Component>`}
                </pre>
              </div>
            </div>
          </div>
        </article>
      </Link>
    </section>
  );
}
