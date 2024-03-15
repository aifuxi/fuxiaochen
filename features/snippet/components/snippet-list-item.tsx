import React from 'react';

import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { PATHS } from '@/constants';
import { toSimpleDateString } from '@/lib/utils';

import { type Snippet } from '../types';

type SnippetListItemProps = {
  snippet: Snippet;
};

export const SnippetListItem = ({ snippet }: SnippetListItemProps) => {
  return (
    <Link
      key={snippet.id}
      href={`${PATHS.SITE_SNIPPET}/${snippet.slug}`}
      className="rounded-2xl border flex items-center h-full p-6 transition-[border] hover:border-primary"
    >
      <div className="grid gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <h3 className="text-2xl font-semibold line-clamp-1">
              {snippet.title}
            </h3>
          </TooltipTrigger>
          <TooltipContent>{snippet.title}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {snippet.description}
            </p>
          </TooltipTrigger>
          <TooltipContent>{snippet.description}</TooltipContent>
        </Tooltip>
        <div className="text-sm text-muted-foreground">
          {toSimpleDateString(snippet.createdAt)}
        </div>
        <div className="flex flex-row gap-2">
          {snippet.tags?.map((tag) => <Badge key={tag.id}>{tag.name}</Badge>)}
        </div>
      </div>
    </Link>
  );
};
