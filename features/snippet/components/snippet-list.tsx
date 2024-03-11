import React from 'react';

import { IllustrationNoContent } from '@/components/illustrations';

import { SnippetListItem } from './snippet-list-item';

import { type Snippet } from '../types';

type SnippetListProps = {
  snippets: Snippet[];
};

export const SnippetList = ({ snippets }: SnippetListProps) => {
  if (!snippets.length) {
    return (
      <div className="grid gap-8 place-content-center">
        <IllustrationNoContent className="w-[30vh] h-[30vh]" />
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center">
          暂无 Snippet
        </h3>
      </div>
    );
  }

  return (
    <ul className="grid gap-4">
      {snippets.map((el) => (
        <li key={el.id}>
          <SnippetListItem snippet={el} />
        </li>
      ))}
    </ul>
  );
};
