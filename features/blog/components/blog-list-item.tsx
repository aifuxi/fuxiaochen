import * as React from "react";

import Link from "next/link";

import { Calendar } from "lucide-react";

import { PATHS } from "@/constants";
import { TagPrefixIcon } from "@/features/tag";
import { prettyDate } from "@/lib/common";
import { cn } from "@/lib/utils";

import { type Blog } from "../types";

interface BlogListItemProps {
  blog: Blog;
}

export const BlogListItem = ({ blog }: BlogListItemProps) => {
  return (
    <Link
      href={`${PATHS.SITE_BLOG}/${blog.slug}`}
      className={cn(
        `
          flex h-full flex-col justify-between rounded-lg px-6 py-4 transition-all
          hover:bg-accent hover:text-accent-foreground
        `,
      )}
    >
      <ul className="mb-1 flex space-x-4 text-xs font-medium">
        {blog.tags.map((tag) => (
          <li key={tag.id} className="flex items-center">
            <span className="mr-1">#&nbsp;{tag.name}</span>
            <TagPrefixIcon tag={tag} />
          </li>
        ))}
      </ul>
      <h4 className="mb-2 line-clamp-1 text-xl font-medium">{blog.title}</h4>
      <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
        {blog.description}
      </p>
      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
        <Calendar className="size-3" />
        <time dateTime={blog.createdAt.toISOString()}>
          {prettyDate(blog.createdAt)}
        </time>
      </div>
    </Link>
  );
};
