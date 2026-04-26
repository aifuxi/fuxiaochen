import { Eye, Heart } from "lucide-react";

import { cn } from "@/lib/utils";

type BlogStatsProps = {
  viewCount: number;
  likeCount: number;
  liked?: boolean;
  className?: string;
};

const countFormatter = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 1,
  notation: "compact",
});

export function formatBlogStatCount(count: number) {
  return countFormatter.format(Math.max(0, count));
}

export function BlogStats({
  viewCount,
  likeCount,
  liked = false,
  className,
}: BlogStatsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 text-xs text-muted-foreground",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5" title="浏览量">
        <Eye className="size-3.5" />
        {formatBlogStatCount(viewCount)}
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-1.5",
          liked && "text-rose-500",
        )}
        title="点赞量"
      >
        <Heart className={cn("size-3.5", liked && "fill-current")} />
        {formatBlogStatCount(likeCount)}
      </span>
    </div>
  );
}
