import React from 'react';

import { type Metadata } from 'next';

import { PageTitle } from '@/components/rsc';

export const metadata: Metadata = {
  title: '日志',
};

export default function LogsPage() {
  return (
    <div className="flex flex-col space-y-8">
      <PageTitle title="日志" />
      <p className="prose dark:prose-invert">
        在这里记录网站更新日志和自己的一些记录
      </p>
    </div>
  );
}
