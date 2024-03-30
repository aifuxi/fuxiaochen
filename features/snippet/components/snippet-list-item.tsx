import React from 'react';

import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { IconSolarEyeBold } from '@/components/icons';

import { PATHS } from '@/constants';
import { toFromNow } from '@/lib/utils';
import { formatNum } from '@/utils';

import { type Snippet } from '../types';

type SnippetListItemProps = {
  snippet: Snippet;
  uvMap?: Record<string, number>;
};

export const SnippetListItem = ({ snippet, uvMap }: SnippetListItemProps) => {
  return (
    <Link
      key={snippet.id}
      href={`${PATHS.SITE_SNIPPET}/${snippet.slug}`}
      className="rounded-2xl border flex items-center h-full p-6 transition-[border] hover:border-primary"
    >
      <div className="grid gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <h3 className="text-lg md:text-2xl font-semibold line-clamp-1">
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

        <div className="text-sm text-muted-foreground flex items-center space-x-2">
          <span>{toFromNow(snippet.createdAt)}</span>
          <span>·</span>
          <div className="flex items-center space-x-1">
            <IconSolarEyeBold />
            <span>{formatNum(uvMap?.[snippet.id])}</span>
          </div>
        </div>
        <div className="flex flex-row gap-2">
          {snippet.tags?.map((tag) => <Badge key={tag.id}>{tag.name}</Badge>)}
        </div>
      </div>
    </Link>
  );
};
