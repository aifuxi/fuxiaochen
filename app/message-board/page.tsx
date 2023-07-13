import React from 'react';

import { Metadata } from 'next';

import { GiscusComment } from '@/components/client';
import { PageTitle } from '@/components/rsc';

export const metadata: Metadata = {
  title: '留言板',
};

export default function MessageBoardPage() {
  return (
    <div className="flex flex-col space-y-8">
      <PageTitle title="留言板" />
      <p className="prose dark:prose-invert">
        在这里和朋友们一起交流，请勿发表一些不合适的言论
      </p>
      <GiscusComment />
    </div>
  );
}
