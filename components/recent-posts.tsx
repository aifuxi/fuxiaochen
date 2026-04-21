import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { blogPosts } from "@/lib/blog-data";

export function RecentPosts() {
  // Get the 5 most recent posts (excluding featured)
  const recentPosts = blogPosts.filter((post) => !post.featured).slice(0, 5);

  return (
    <section className="border-border border-t py-16">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            Recent Posts
          </h2>
          <Link
            href="/blog"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
          >
            All posts
            <ArrowRight className="size-3" />
          </Link>
        </div>

        <div className="flex flex-col">
          {recentPosts.map((post, index) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className={`group hover:text-foreground flex items-center justify-between py-4 transition-colors ${
                index !== recentPosts.length - 1 ? "border-border border-b" : ""
              }`}
            >
              <span className="text-foreground group-hover:text-foreground/80 font-medium">
                {post.title}
              </span>
              <time className="text-muted-foreground shrink-0 text-sm">
                {post.date}
              </time>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
