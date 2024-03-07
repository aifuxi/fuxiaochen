'use client';

import * as React from 'react';

import { Viewer } from '@bytemd/react';

import { plugins, sanitize } from './config';

type Props = {
  content: string;
};

export function BytemdViewer({ content }: Props) {
  return <Viewer value={content} plugins={plugins} sanitize={sanitize} />;
}
