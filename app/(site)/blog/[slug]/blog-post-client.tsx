"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { ArrowLeft, Calendar, Clock, Eye, Heart } from "lucide-react";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { BlogComments } from "@/components/blog-comments";
import { BlogCoverImage } from "@/components/blog-cover-image";
import { formatBlogStatCount } from "@/components/blog-stats";
import { MarkdownPreview } from "@/components/markdown-preview";
import { SimilarPosts } from "@/components/similar-posts";
import { TableOfContents } from "@/components/table-of-contents";

import { apiRequest, fetchApiData } from "@/lib/api/fetcher";
import type { PublicBlog } from "@/lib/server/blogs/mappers";
import { cn } from "@/lib/utils";

import { routes } from "@/constants/routes";
import { siteCopy } from "@/constants/site-copy";

type BlogPostClientProps = {
  slug: string;
  initialPost?: PublicBlog;
  initialSimilarPosts?: PublicBlog[];
};

export function BlogPostClient({
  slug,
  initialPost,
  initialSimilarPosts,
}: BlogPostClientProps) {
  const [isLikePending, setIsLikePending] = useState(false);
  const {
    data: post,
    error,
    mutate: mutatePost,
  } = useSWR<PublicBlog>(`/api/public/blogs/${slug}`, fetchApiData, {
    fallbackData: initialPost,
    revalidateOnFocus: false,
  });
  const { data: similarResponse } = useSWR<{ items: PublicBlog[] }>(
    `/api/public/blogs/${slug}/similar?limit=3`,
    fetchApiData,
    {
      fallbackData: {
        items: initialSimilarPosts ?? [],
      },
      revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    if (!post?.slug) {
      return;
    }

    let isActive = true;

    void apiRequest<{ viewCount: number; counted: boolean }>(
      `/api/public/blogs/${slug}/view`,
      {
        method: "POST",
        toastOnError: false,
      },
    )
      .then((payload) => {
        if (!isActive) {
          return;
        }

        void mutatePost(
          (currentPost) =>
            currentPost
              ? { ...currentPost, viewCount: payload.data.viewCount }
              : currentPost,
          false,
        );
      })
      .catch(() => {
        // Content remains usable when Redis statistics are unavailable.
      });

    return () => {
      isActive = false;
    };
  }, [mutatePost, post?.slug, slug]);

  const handleLike = async () => {
    if (!post || isLikePending) {
      return;
    }

    const previousPost = post;
    const optimisticPost: PublicBlog = {
      ...post,
      liked: !post.liked,
      likeCount: Math.max(0, post.likeCount + (post.liked ? -1 : 1)),
    };

    setIsLikePending(true);
    await mutatePost(optimisticPost, false);

    try {
      const payload = await apiRequest<{ likeCount: number; liked: boolean }>(
        `/api/public/blogs/${slug}/like`,
        {
          method: "POST",
          errorFallback: "点赞失败，请稍后重试",
        },
      );

      await mutatePost(
        (currentPost) =>
          currentPost
            ? {
                ...currentPost,
                likeCount: payload.data.likeCount,
                liked: payload.data.liked,
              }
            : currentPost,
        false,
      );
    } catch {
      await mutatePost(previousPost, false);
    } finally {
      setIsLikePending(false);
    }
  };

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-lg font-medium text-foreground">
          {siteCopy.blogPost.notFound}
        </p>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-muted-foreground">{siteCopy.blogPost.loading}</p>
      </main>
    );
  }

  return (
    <>
      <div className="relative h-[40vh] min-h-[300px] w-full md:h-[50vh]">
        <BlogCoverImage
          src={post.coverImage}
          alt={post.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <main className="mx-auto max-w-4xl px-6">
        <Link
          href={routes.site.blog}
          className="relative z-10 -mt-20 mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {siteCopy.blogPost.backToBlog}
        </Link>

        <header className="mb-12">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Badge variant="secondary">{post.category}</Badge>
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-sm text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="mb-6 text-3xl font-bold tracking-tight text-balance text-foreground md:text-4xl">
            {post.title}
          </h1>

          <p className="mb-6 text-lg text-muted-foreground">
            {post.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              {post.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {post.readTime}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="size-4" />
              {formatBlogStatCount(post.viewCount)}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-pressed={post.liked}
              disabled={isLikePending}
              onClick={handleLike}
              className={cn(
                "h-auto px-2 py-1 text-muted-foreground hover:text-foreground",
                post.liked && "text-rose-500 hover:text-rose-500",
              )}
            >
              <Heart className={cn("size-4", post.liked && "fill-current")} />
              {formatBlogStatCount(post.likeCount)}
            </Button>
          </div>
        </header>

        <div className="relative">
          <MarkdownPreview cacheKey={post.slug} content={post.content} />

          <aside className="absolute top-0 left-[calc(100%+2rem)] hidden h-full w-52 min-[1380px]:block 2xl:left-[calc(100%+3rem)] 2xl:w-56">
            <TableOfContents content={post.content} />
          </aside>
        </div>

        <BlogComments postSlug={slug} />
      </main>

      <SimilarPosts posts={similarResponse?.items ?? []} />
    </>
  );
}
