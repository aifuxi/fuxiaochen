"use client";

import { Viewer } from "@bytemd/react";

import {
  markdownPlugins,
  sanitizeMarkdownSchema,
} from "@/lib/markdown/bytemd-plugins";
import { cn } from "@/lib/utils";

type MarkdownPreviewProps = {
  cacheKey?: string;
  className?: string;
  content: string;
};

export function MarkdownPreview({
  cacheKey,
  className,
  content,
}: MarkdownPreviewProps) {
  return (
    <article className={cn("prose-custom min-w-0 pb-16", className)}>
      <Viewer
        key={cacheKey ?? content}
        value={content}
        plugins={markdownPlugins}
        sanitize={sanitizeMarkdownSchema}
      />
    </article>
  );
}
