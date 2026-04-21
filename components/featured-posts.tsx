import Image from "next/image";
import Link from "next/link";

import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { getFeaturedPosts } from "@/lib/blog-data";

export function FeaturedPosts() {
  const featuredPosts = getFeaturedPosts();

  return (
    <section className="border-border border-t py-16">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            Featured
          </h2>
          <Link
            href="/blog"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            View all
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {featuredPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group border-border bg-card hover:bg-accent/50 flex flex-col overflow-hidden rounded-lg border transition-colors"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{post.category}</Badge>
                  <ArrowUpRight className="text-muted-foreground size-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <h3 className="text-foreground group-hover:text-foreground/90 font-medium text-balance">
                  {post.title}
                </h3>
                <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                  {post.description}
                </p>
                <time className="text-muted-foreground mt-auto text-xs">
                  {post.date}
                </time>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
