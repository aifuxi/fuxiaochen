"use client";

import breaks from "@bytemd/plugin-breaks";
import frontmatter from "@bytemd/plugin-frontmatter";
import gfm from "@bytemd/plugin-gfm";
import highlightSsr from "@bytemd/plugin-highlight-ssr";
import mediumZoom from "@bytemd/plugin-medium-zoom";
import { Viewer } from "@bytemd/react";

const plugins = [gfm(), frontmatter(), breaks(), highlightSsr(), mediumZoom()];

export function MarkdownViewer({ value }: { value: string }) {
  return <Viewer plugins={plugins} value={value} />;
}
