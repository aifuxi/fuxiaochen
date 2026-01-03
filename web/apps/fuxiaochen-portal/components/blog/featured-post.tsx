import Link from "next/link";

import {
  ArrowUpRight02Icon,
  Calendar04Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Badge } from "@/components/ui/badge";

import { Blog } from "@/api/blog";
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
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">精选博客</h2>
        <Badge variant="secondary" className="font-mono text-xs">
          最新
        </Badge>
      </div>

      <Link href={`${PATHS.BLOG}/${featuredBlog.slug}`} className="group block">
        <article className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <HugeiconsIcon icon={Calendar04Icon} className="w-4 h-4" />
                  {formattedDate(new Date(featuredBlog.createdAt))}
                </span>
                <span className="flex items-center gap-1.5">
                  <HugeiconsIcon icon={Clock01Icon} className="w-4 h-4" />
                  预计阅读 {calculateReadTime(featuredBlog.content)} 分钟
                </span>
              </div>

              <h3 className="text-3xl font-bold mb-4 group-hover:text-primary transition-colors">
                {featuredBlog.title}
              </h3>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                {featuredBlog.description}
              </p>

              <div className="flex items-center gap-3 flex-wrap mb-6">
                {featuredBlog?.tags?.map((tag) => (
                  <Badge key={tag.id} variant="outline" className="font-mono">
                    {tag.name}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2 text-primary font-medium">
                查看详情
                <HugeiconsIcon
                  icon={ArrowUpRight02Icon}
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                />
              </div>
            </div>

            <div className="bg-secondary rounded-lg p-8 flex items-center justify-center">
              <div className="w-full aspect-square bg-muted/30 rounded-lg border border-border flex items-center justify-center">
                <pre className="text-xs font-mono text-muted-foreground">
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
