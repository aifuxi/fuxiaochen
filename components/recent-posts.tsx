import Link from "next/link";

import { ArrowRight } from "lucide-react";

import type { PublicBlog } from "@/lib/server/blogs/mappers";

import { routes } from "@/constants/routes";
import { siteCopy } from "@/constants/site-copy";

type RecentPostsProps = {
  posts: PublicBlog[];
};

export function RecentPosts({ posts }: RecentPostsProps) {
  return (
    <section className="border-t border-border py-16">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {siteCopy.home.recentTitle}
          </h2>
          <Link
            href={routes.site.blog}
            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {siteCopy.home.recentAction}
            <ArrowRight className="size-3" />
          </Link>
        </div>

        <div className="flex flex-col">
          {posts.map((post, index) => (
            <Link
              key={post.slug}
              href={routes.site.blogPost(post.slug)}
              className={`group flex items-center justify-between py-4 transition-colors hover:text-foreground ${
                index !== posts.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="font-medium text-foreground group-hover:text-foreground/80">
                {post.title}
              </span>
              <time className="shrink-0 text-sm text-muted-foreground">
                {post.date}
              </time>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
