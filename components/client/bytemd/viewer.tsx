'use client';

import { Viewer } from '@bytemd/react';

import { plugins } from './config';

type Props = {
  content: string;
};

const BytemdViewer: React.FC<Props> = ({ content }) => {
  return <Viewer value={content} plugins={plugins} />;
};

export default BytemdViewer;
