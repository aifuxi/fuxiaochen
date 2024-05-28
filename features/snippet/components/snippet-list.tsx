import { IllustrationNoContent } from "@/components/illustrations";

import { SnippetListItem } from "./snippet-list-item";

import { type Snippet } from "../types";

type SnippetListProps = {
  snippets: Snippet[];
  uvMap?: Record<string, number>;
};

export const SnippetList = ({ snippets, uvMap }: SnippetListProps) => {
  if (!snippets.length) {
    return (
      <div className="grid place-content-center gap-8">
        <IllustrationNoContent className="size-[30vh]" />
        <h3 className="text-center text-2xl font-semibold tracking-tight">
          暂无片段
        </h3>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-10 md:grid-cols-2">
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
