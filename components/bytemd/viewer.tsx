'use client';

import * as React from 'react';

import { Viewer } from '@bytemd/react';

import { plugins, sanitize } from './config';

type BytemdViewerProps = {
  content: string;
};

export const BytemdViewer = ({ content }: BytemdViewerProps) => {
  return <Viewer value={content} plugins={plugins} sanitize={sanitize} />;
};
