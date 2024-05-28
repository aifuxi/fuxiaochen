"use client";

import React from "react";

import { Viewer } from "@bytemd/react";

import { plugins, sanitize } from "./config";

type BytemdViewerProps = {
  body: string;
};

export const BytemdViewer = ({ body }: BytemdViewerProps) => {
  return <Viewer value={body} plugins={plugins} sanitize={sanitize} />;
};
