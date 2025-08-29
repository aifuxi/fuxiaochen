import * as React from "react";

import Link from "next/link";

import { Calendar } from "lucide-react";

import { PATHS } from "@/constants";
import { TagPrefixIcon } from "@/features/tag";
import { prettyDate } from "@/lib/common";
import { cn } from "@/lib/utils";

import { type Snippet } from "../types";

interface SnippetListItemProps {
  snippet: Snippet;
}

export const SnippetListItem = ({ snippet }: SnippetListItemProps) => {
  return (
    <Link
      href={`${PATHS.SITE_SNIPPET}/${snippet.slug}`}
      className={cn(
        "flex h-full flex-col justify-between rounded-lg px-6 py-4 text-primary transition-colors",
        `
          bg-transparent
          hover:bg-primary-foreground
        `,
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
      </div>
    </Link>
  );
};
