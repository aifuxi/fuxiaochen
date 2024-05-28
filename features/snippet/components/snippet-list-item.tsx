import React from 'react';

import Link from 'next/link';

import { Calendar, Eye } from 'lucide-react';

import { PATHS, PLACEHOLDER_TEXT } from '@/constants';
import { TagPrefixIcon } from '@/features/tag';
import { cn, prettyDate } from '@/lib/utils';
import { formatNum } from '@/utils';

import { type Snippet } from '../types';

type SnippetListItemProps = {
  snippet: Snippet;
  uvMap?: Record<string, number>;
};

export const SnippetListItem = ({ snippet, uvMap }: SnippetListItemProps) => {
  return (
    <Link
      href={`${PATHS.SITE_SNIPPET}/${snippet.slug}`}
      className={cn(
        'flex flex-col justify-between h-full text-primary px-6 py-4 transition-colors rounded-lg',
        'bg-transparent hover:bg-primary-foreground ',
      )}
    >
      <ul className="mb-1 flex space-x-4 text-xs font-medium text-muted-foreground">
        {snippet.tags.map((tag) => (
          <li key={tag.id} className="flex items-center">
            <span className="mr-1">#&nbsp;{tag.name}</span>
            <TagPrefixIcon tag={tag} />
          </li>
        ))}
      </ul>
      <h4 className="mb-2 line-clamp-1 text-xl font-medium">{snippet.title}</h4>
      <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
        {snippet.description}
      </p>
      <div className="flex space-x-2 text-xs text-muted-foreground">
        <div className="flex h-5 items-center space-x-1">
          <Calendar className="size-3" />
          <time dateTime={snippet.createdAt.toISOString()}>
            {prettyDate(snippet.createdAt)}
          </time>
        </div>
        <div className="flex h-5 items-center space-x-1">
          <Eye className="size-3" />
          <span>
            {formatNum(uvMap?.[snippet.id])
              ? formatNum(uvMap?.[snippet.id])
              : PLACEHOLDER_TEXT}
          </span>
        </div>
      </div>
    </Link>
  );
};
