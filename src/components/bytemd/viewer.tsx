"use client";

import { Viewer } from "@bytemd/react";

import { plugins } from "./config";

type BytemdViewerProps = {
  body: string;
};

export const BytemdViewer = ({ body }: BytemdViewerProps) => {
  return <Viewer value={body} plugins={plugins} />;
};
