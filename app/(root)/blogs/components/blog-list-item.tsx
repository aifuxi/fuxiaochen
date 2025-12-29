import * as React from "react";

import Link from "next/link";

import { Calendar, TagIcon } from "lucide-react";

import { type Blog } from "@/api/blog";
import { PATHS } from "@/constants";
import { checkUpdate, toFromNow } from "@/lib/common";
import { cn } from "@/lib/utils";

interface BlogListItemProps {
  blog: Blog;
}

export const BlogListItem = ({ blog }: BlogListItemProps) => {
  // 如果更新时间和创建时间相差超过5分钟，才显示更新时间
  const showUpdate = checkUpdate({
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
  });

  return (
    <Link
      href={`${PATHS.BLOG}/${blog.slug}`}
      className={cn(
        `
          flex h-full flex-col justify-between gap-2 rounded-lg px-6 py-4 transition-all
          hover:bg-accent hover:text-accent-foreground
        `,
      )}
    >
      <h4 className="line-clamp-1 text-xl font-medium">{blog.title}</h4>
      <p className="line-clamp-2 text-sm text-muted-foreground">
        {blog.description}
      </p>
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        {blog.category && (
          <div className="flex items-center">
            #<span>{blog?.category?.name}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Calendar className="size-3" />
          <time dateTime={new Date(blog.createdAt).toISOString()}>
            {toFromNow(blog.createdAt)}
          </time>
          {showUpdate && (
            <time
              dateTime={new Date(blog.updatedAt).toISOString()}
              className="text-muted-foreground/70"
            >
              （更新于{toFromNow(blog.updatedAt)}）
            </time>
          )}
        </div>
        <ul className="flex flex-wrap items-center gap-4">
          {blog?.tags?.map((tag) => (
            <li key={tag.id} className="flex items-center gap-1">
              <TagIcon className="size-3" />
              <span>{tag.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
};
