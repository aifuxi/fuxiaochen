import React from 'react';

import Link from 'next/link';

import { NICKNAME, PATHS } from '@/config';

import { Badge } from '@/components/ui/badge';

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
      className="rounded-2xl border flex items-center p-6"
    >
      <div className="grid gap-2">
        <h3 className="text-2xl font-semibold">{article.title}</h3>
        <p className="text-sm text-muted-foreground">{article.description}</p>
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
