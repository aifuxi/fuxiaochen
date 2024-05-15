import React from 'react';

import Link from 'next/link';

import { Calendar, Eye } from 'lucide-react';

import { PATHS, PLACEHODER_TEXT } from '@/constants';
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
      href={`${PATHS.SITE_BLOG}/${snippet.slug}`}
      className={cn(
        'flex flex-col justify-between h-full text-primary px-6 py-4 transition-colors rounded-lg',
        'bg-transparent hover:bg-primary-foreground ',
      )}
    >
      <ul className="text-xs font-medium text-muted-foreground mb-1 flex space-x-4">
        {snippet.tags.map((tag) => (
          <li key={tag.id}>#&nbsp;{tag.name}</li>
        ))}
      </ul>
      <h4 className="text-xl font-medium line-clamp-1 mb-2">{snippet.title}</h4>
      <p className="line-clamp-2 text-sm text-muted-foreground mb-3">
        {snippet.description}
      </p>
      <div className="text-xs text-muted-foreground flex space-x-2">
        <div className="flex space-x-1 items-center h-5">
          <Calendar className="w-3 h-3" />
          <time dateTime={snippet.createdAt.toISOString()}>
            {prettyDate(snippet.createdAt)}
          </time>
        </div>
        <div className="flex space-x-1 items-center h-5">
          <Eye className="w-3 h-3" />
          <span>
            {formatNum(uvMap?.[snippet.id])
              ? formatNum(uvMap?.[snippet.id])
              : PLACEHODER_TEXT}
          </span>
        </div>
      </div>
    </Link>
  );
};
