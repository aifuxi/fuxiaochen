"use client";

import { Editor } from "@bytemd/react";

import {
  markdownEditorPlugins,
  sanitizeMarkdownSchema,
} from "@/lib/markdown/bytemd-plugins";
import { cn } from "@/lib/utils";

type MarkdownEditorProps = {
  className?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

export function MarkdownEditor({
  className,
  onChange,
  placeholder,
  value,
}: MarkdownEditorProps) {
  return (
    <div className={cn("markdown-editor h-full min-h-0", className)}>
      <Editor
        value={value}
        plugins={markdownEditorPlugins}
        sanitize={sanitizeMarkdownSchema}
        placeholder={placeholder}
        onChange={onChange}
      />
    </div>
  );
}
