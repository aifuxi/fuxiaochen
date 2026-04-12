"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

type ArticleStatsPanelProps = {
  authorName: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  category: string;
  title: string;
  initialLikes?: number;
  initialViews?: number;
};

export function ArticleStatsPanel({
  authorAvatar,
  authorName,
  category,
  date,
  initialLikes = 328,
  initialViews = 2847,
  readTime,
  title,
}: ArticleStatsPanelProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);

  const toggleLike = () => {
    setLiked((current) => {
      const next = !current;
      setLikes((value) => value + (next ? 1 : -1));
      return next;
    });
  };

  return (
    <>
      <section className="px-8 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="hero-label-dot" />
            <span className="font-mono-tech text-primary-accent text-xs tracking-widest uppercase">{category}</span>
          </div>

          <h1 className="article-title mb-8 font-serif">{title}</h1>

          <div className="author-meta flex flex-wrap items-center gap-6">
            <img
              alt="Author avatar"
              className="h-12 w-12 rounded-full border-2 border-white/8 object-cover"
              src={authorAvatar}
            />
            <div className="flex items-center gap-3">
              <span className="author-name">{authorName}</span>
              <span className="meta-divider">•</span>
              <span className="text-sm text-muted">{date}</span>
              <span className="meta-divider">•</span>
              <span className="text-sm text-muted">{readTime}</span>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted">
                <span>◔</span>
                <span className="font-mono-tech text-sm">{initialViews.toLocaleString()}</span>
              </div>
              <button className="flex items-center gap-2 text-muted" type="button" onClick={toggleLike}>
                <span className={cn(liked ? "text-primary" : "")}>♥</span>
                <span className="font-mono-tech text-sm">{likes}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="glass-card shimmer-border flex items-center justify-between p-8">
            <button
              className={cn(
                `
                  flex items-center gap-3 rounded-full border border-white/10 px-8 py-4 transition-all duration-300
                  hover:border-primary/50
                `,
                liked && "border-primary/50 bg-primary/8",
              )}
              type="button"
              onClick={toggleLike}
            >
              <span className={cn("transition-colors", liked ? "text-primary" : "text-primary-accent")}>♥</span>
              <span className="font-mono-tech text-sm">喜欢这篇文章</span>
              <span className="font-mono-tech text-sm text-muted">{likes}</span>
            </button>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-muted">
                <span>◔</span>
                <span className="font-mono-tech text-sm">{initialViews.toLocaleString()} 次阅读</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <span>◷</span>
                <span className="font-mono-tech text-sm">{readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
