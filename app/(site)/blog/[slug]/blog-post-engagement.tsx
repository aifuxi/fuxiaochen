"use client";

import { useEffect, useState } from "react";

import { Calendar, Clock, Eye, Heart } from "lucide-react";
import useSWR from "swr";

import { Button } from "@/components/ui/button";

import { formatBlogStatCount } from "@/components/blog-stats";

import { apiRequest, fetchApiData } from "@/lib/api/fetcher";
import type { PublicBlog } from "@/lib/server/blogs/mappers";
import { cn } from "@/lib/utils";

import { siteCopy } from "@/constants/site-copy";

type BlogPostEngagementProps = {
  initialPost: PublicBlog;
  slug: string;
};

function useBlogPostEngagement({ initialPost, slug }: BlogPostEngagementProps) {
  const [isLikePending, setIsLikePending] = useState(false);
  const { data: post, mutate: mutatePost } = useSWR<PublicBlog>(
    `/api/public/blogs/${slug}`,
    fetchApiData,
    {
      fallbackData: initialPost,
      revalidateOnFocus: false,
    },
  );

  const currentPost = post ?? initialPost;

  const handleLike = async () => {
    if (isLikePending) {
      return;
    }

    const previousPost = currentPost;
    const optimisticPost: PublicBlog = {
      ...currentPost,
      liked: !currentPost.liked,
      likeCount: Math.max(
        0,
        currentPost.likeCount + (currentPost.liked ? -1 : 1),
      ),
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
        (latestPost) =>
          latestPost
            ? {
                ...latestPost,
                likeCount: payload.data.likeCount,
                liked: payload.data.liked,
              }
            : latestPost,
        false,
      );
    } catch {
      await mutatePost(previousPost, false);
    } finally {
      setIsLikePending(false);
    }
  };

  return {
    handleLike,
    isLikePending,
    post: currentPost,
    mutatePost,
  };
}

export function BlogPostStatsClient({
  initialPost,
  slug,
}: BlogPostEngagementProps) {
  const { handleLike, isLikePending, mutatePost, post } = useBlogPostEngagement(
    {
      initialPost,
      slug,
    },
  );

  useEffect(() => {
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
          (latestPost) =>
            latestPost
              ? { ...latestPost, viewCount: payload.data.viewCount }
              : latestPost,
          false,
        );
      })
      .catch(() => {
        // Content remains usable when statistics are unavailable.
      });

    return () => {
      isActive = false;
    };
  }, [mutatePost, slug]);

  return (
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
  );
}

export function BlogPostLikeCta({
  initialPost,
  slug,
}: BlogPostEngagementProps) {
  const { handleLike, isLikePending, post } = useBlogPostEngagement({
    initialPost,
    slug,
  });

  return (
    <section className="mt-14 mb-12 border-y border-border py-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {siteCopy.blogPost.likeCtaTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {post.liked
              ? siteCopy.blogPost.likeCtaLikedDescription
              : siteCopy.blogPost.likeCtaDescription}
          </p>
        </div>

        <Button
          type="button"
          size="lg"
          aria-pressed={post.liked}
          disabled={isLikePending}
          onClick={handleLike}
          className={cn(
            "min-w-32 active:scale-[0.98]",
            post.liked &&
              "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/60",
          )}
        >
          <Heart className={cn("size-4", post.liked && "fill-current")} />
          {post.liked
            ? siteCopy.blogPost.likeCtaLikedAction
            : siteCopy.blogPost.likeCtaAction}
          <span className="text-xs opacity-80">
            {formatBlogStatCount(post.likeCount)}
          </span>
        </Button>
      </div>
    </section>
  );
}
