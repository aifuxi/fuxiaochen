import { type Metadata } from 'next';

import { GiscusComment } from '@/components/giscus-comment';
import { PageTitle } from '@/components/page-title';

export const metadata: Metadata = {
  title: '留言板',
};

export default function MessageBoardPage() {
  return (
    <div className="container mx-auto">
      <div className="h-screen flex flex-col gap-8 pb-8">
        <PageTitle title="留言板" />

        <p className="text-xl text-muted-foreground">留下你的足迹 ...</p>

        <GiscusComment />
      </div>
    </div>
  );
}
