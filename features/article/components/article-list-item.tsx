import React from 'react';

import Link from 'next/link';

import { NICKNAME, PATHS } from '@/config';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { toSimpleDateString } from '@/lib/utils';

import { type Article } from '../types';

type ArticleListItemProps = {
  article: Article;
};

export const ArticleListItem = ({ article }: ArticleListItemProps) => {
  return (
    <Link
      key={article.id}
      href={`${PATHS.SITE_ARTICLES}/${article.slug}`}
      className="rounded-2xl border flex items-center p-6 transition-[border] hover:border-primary h-full"
    >
      <div className="grid gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <h3 className="text-2xl font-semibold line-clamp-1">
              {article.title}
            </h3>
          </TooltipTrigger>
          <TooltipContent>{article.title}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {article.description}
            </p>
          </TooltipTrigger>
          <TooltipContent>{article.description}</TooltipContent>
        </Tooltip>

        <div className="text-sm text-muted-foreground">
          {NICKNAME}&nbsp;·&nbsp;
          {toSimpleDateString(article.createdAt)}
        </div>
        <div className="flex flex-row gap-2">
          {article.tags?.map((tag) => <Badge key={tag.id}>{tag.name}</Badge>)}
        </div>
      </div>
    </Link>
  );
};
