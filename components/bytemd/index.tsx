"use client";

import { Viewer } from "@bytemd/react";

interface BytemdViewerProps {
  body: string;
}

const BytemdViewer = ({ body }: BytemdViewerProps) => {
  return <Viewer value={body} />;
};

export default BytemdViewer;
