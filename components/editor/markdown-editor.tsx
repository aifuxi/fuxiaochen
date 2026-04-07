"use client";

import breaks from "@bytemd/plugin-breaks";
import frontmatter from "@bytemd/plugin-frontmatter";
import gfm from "@bytemd/plugin-gfm";
import highlightSsr from "@bytemd/plugin-highlight-ssr";
import mediumZoom from "@bytemd/plugin-medium-zoom";
import { Editor } from "@bytemd/react";

const plugins = [gfm(), frontmatter(), breaks(), highlightSsr(), mediumZoom()];

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function MarkdownEditor({ onChange, value }: MarkdownEditorProps) {
  return (
    <Editor
      mode="split"
      plugins={plugins}
      placeholder="Write the article in Markdown..."
      value={value}
      onChange={onChange}
    />
  );
}
