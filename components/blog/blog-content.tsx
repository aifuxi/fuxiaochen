"use client";

import breaks from "@bytemd/plugin-breaks";
import gfm from "@bytemd/plugin-gfm";
import highlight from "@bytemd/plugin-highlight-ssr";
import mediumZoom from "@bytemd/plugin-medium-zoom";
import { Viewer } from "@bytemd/react";
// import "highlight.js/styles/atom-one-dark.css";
import copyCodePlugin from "./plugin-copy-code";
import headingsPlugin from "./plugin-headings";

const plugins = [
  gfm(),
  breaks(),
  highlight(),
  mediumZoom(),
  copyCodePlugin(),
  headingsPlugin(),
];

export default function BlogContent({ content }: { content: string }) {
  return (
    <div className="glass-prose mx-auto w-full">
      <Viewer value={content} plugins={plugins} />
    </div>
  );
}
