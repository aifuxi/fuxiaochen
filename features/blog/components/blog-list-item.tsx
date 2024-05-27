import React from 'react';

import Link from 'next/link';

import { Calendar, Eye } from 'lucide-react';

import { PATHS, PLACEHOLDER_TEXT } from '@/constants';
import { TagPrefixIcon } from '@/features/tag';
import { cn, prettyDate } from '@/lib/utils';
import { formatNum } from '@/utils';

import { type Blog } from '../types';

type BlogListItemProps = {
  blog: Blog;
  uvMap?: Record<string, number>;
};

export const BlogListItem = ({ blog, uvMap }: BlogListItemProps) => {
  return (
    <Link
      href={`${PATHS.SITE_BLOG}/${blog.slug}`}
      className={cn(
        'flex flex-col justify-between h-full text-primary px-6 py-4 transition-colors rounded-lg',
        'bg-transparent hover:bg-primary-foreground ',
      )}
    >
      <ul className="text-xs font-medium text-muted-foreground mb-1 flex space-x-4">
        {blog.tags.map((tag) => (
          <li key={tag.id} className="flex items-center">
            <span className="mr-1">#&nbsp;{tag.name}</span>
            <TagPrefixIcon tag={tag} />
          </li>
        ))}
      </ul>
      <h4 className="text-xl font-medium line-clamp-1 mb-2">{blog.title}</h4>
      <p className="line-clamp-2 text-sm text-muted-foreground mb-3">
        {blog.description}
      </p>
      <div className="text-xs text-muted-foreground flex space-x-2">
        <div className="flex space-x-1 items-center h-5">
          <Calendar className="w-3 h-3" />
          <time dateTime={blog.createdAt.toISOString()}>
            {prettyDate(blog.createdAt)}
          </time>
        </div>
        <div className="flex space-x-1 items-center h-5">
          <Eye className="w-3 h-3" />
          <span>
            {formatNum(uvMap?.[blog.id])
              ? formatNum(uvMap?.[blog.id])
              : PLACEHOLDER_TEXT}
          </span>
        </div>
      </div>
    </Link>
  );
};
