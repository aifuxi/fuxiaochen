"use client";

import Link from "next/link";

import { ArrowUpRight } from "lucide-react";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";

import { BlogCoverImage } from "@/components/blog-cover-image";
import { BlogStats } from "@/components/blog-stats";

import { fetchApiData } from "@/lib/api/fetcher";
import type { PublicBlog } from "@/lib/server/blogs/mappers";

import { routes } from "@/constants/routes";
import { siteCopy } from "@/constants/site-copy";

export function FeaturedPosts() {
  const { data } = useSWR<{ items: PublicBlog[] }>(
    "/api/public/blogs?featured=true&pageSize=3",
    fetchApiData,
    {
      revalidateOnFocus: false,
    },
  );

  const featuredPosts = data?.items ?? [];

  return (
    <section className="border-t border-border py-16">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {siteCopy.home.featuredTitle}
          </h2>
          <Link
            href={routes.site.blog}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {siteCopy.home.featuredAction}
          </Link>
        </div>

        {featuredPosts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {featuredPosts.map((post) => (
              <Link
                key={post.slug}
                href={routes.site.blogPost(post.slug)}
                className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:bg-accent/50"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <BlogCoverImage
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{post.category}</Badge>
                    <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <h3 className="font-medium text-balance text-foreground group-hover:text-foreground/90">
                    {post.title}
                  </h3>
                  <BlogStats
                    viewCount={post.viewCount}
                    likeCount={post.likeCount}
                    liked={post.liked}
                  />
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {post.description}
                  </p>
                  <time className="mt-auto text-xs text-muted-foreground">
                    {post.date}
                  </time>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-10 text-center">
            <p className="text-lg font-medium text-foreground">
              {siteCopy.home.featuredEmptyTitle}
            </p>
            <p className="mt-2 text-muted-foreground">
              {siteCopy.home.featuredEmptyDescription}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
