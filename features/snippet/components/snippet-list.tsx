import { IllustrationNoContent } from '@/components/illustrations';

import { SnippetListItem } from './snippet-list-item';

import { type Snippet } from '../types';

type SnippetListProps = {
  snippets: Snippet[];
  uvMap?: Record<string, number>;
};

export const SnippetList = ({ snippets, uvMap }: SnippetListProps) => {
  if (!snippets.length) {
    return (
      <div className="grid gap-8 place-content-center">
        <IllustrationNoContent className="w-[30vh] h-[30vh]" />
        <h3 className="text-2xl font-semibold tracking-tight text-center">
          暂无片段
        </h3>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {snippets.map((el, idx) => (
        <li
          key={el.id}
          className="animate-fade-up animate-ease-in-out"
          style={{
            animationDelay: `${(idx + 1) * 200}ms`,
          }}
        >
          <SnippetListItem snippet={el} uvMap={uvMap} />
        </li>
      ))}
    </ul>
  );
};
