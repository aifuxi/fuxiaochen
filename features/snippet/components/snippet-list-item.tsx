import React from 'react';

import Link from 'next/link';

import { PATHS } from '@/config';

import { Badge } from '@/components/ui/badge';

import { toSimpleDateString } from '@/lib/utils';

import { type Snippet } from '../types';

type SnippetListItemProps = {
  snippet: Snippet;
};

export const SnippetListItem = ({ snippet }: SnippetListItemProps) => {
  return (
    <Link
      key={snippet.id}
      href={`${PATHS.SITE_SNIPPETS}/${snippet.slug}`}
      className="rounded-2xl border flex items-center p-6"
    >
      <div className="grid gap-2">
        <h3 className="text-2xl font-semibold">{snippet.title}</h3>
        <p className="text-sm text-muted-foreground">{snippet.description}</p>
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
