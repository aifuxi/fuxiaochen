'use client';

import { Viewer } from '@bytemd/react';

import { plugins } from './config';

type Props = {
  content: string;
};

const BytemdViewer: React.FC<Props> = ({ content }) => {
  return (
    <div className="prose w-full">
      <Viewer value={content} plugins={plugins} />
    </div>
  );
};

export default BytemdViewer;
