import React from 'react';

import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { NICKNAME, PATHS } from '@/constants';
import { toSimpleDateString } from '@/lib/utils';

import { type Blog } from '../types';

type BlogListItemProps = {
  blog: Blog;
};

export const BlogListItem = ({ blog }: BlogListItemProps) => {
  return (
    <Link
      key={blog.id}
      href={`${PATHS.SITE_BLOG}/${blog.slug}`}
      className="rounded-2xl border flex items-center p-6 transition-[border] hover:border-primary h-full"
    >
      <div className="grid gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <h3 className="text-2xl font-semibold line-clamp-1">
              {blog.title}
            </h3>
          </TooltipTrigger>
          <TooltipContent>{blog.title}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {blog.description}
            </p>
          </TooltipTrigger>
          <TooltipContent>{blog.description}</TooltipContent>
        </Tooltip>

        <div className="text-sm text-muted-foreground">
          {blog.author ? blog.author : NICKNAME}
          <span className="mx-2">·</span>
          {toSimpleDateString(blog.createdAt)}
        </div>
        <div className="flex flex-row gap-2">
          {blog.tags?.map((tag) => <Badge key={tag.id}>{tag.name}</Badge>)}
        </div>
      </div>
    </Link>
  );
};
