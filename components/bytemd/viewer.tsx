'use client';

import { Viewer } from '@bytemd/react';

import { plugins } from './config';

type Props = {
  content: string;
};

export function BytemdViewer({ content }: Props) {
  return <Viewer value={content} plugins={plugins} />;
}
