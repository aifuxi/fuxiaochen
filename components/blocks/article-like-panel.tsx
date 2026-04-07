"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type ArticleLikePanelProps = {
  initialLikes?: number;
  readTime: string;
  views?: number;
};

export function ArticleLikePanel({
  initialLikes = 328,
  readTime,
  views = 2847,
}: ArticleLikePanelProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);

  return (
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
        onClick={() => {
          setLiked((current) => {
            const next = !current;
            setLikes((value) => value + (next ? 1 : -1));
            return next;
          });
        }}
      >
        <span className={cn("transition-colors", liked ? "text-primary" : "text-primary-accent")}>♥</span>
        <span className="font-mono-tech text-sm">Like this article</span>
        <span className="font-mono-tech text-sm text-muted">{likes}</span>
      </button>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-muted">
          <span>◔</span>
          <span className="font-mono-tech text-sm">{views.toLocaleString()} views</span>
        </div>
        <div className="flex items-center gap-2 text-muted">
          <span>◷</span>
          <span className="font-mono-tech text-sm">{readTime}</span>
        </div>
      </div>
    </div>
  );
}
