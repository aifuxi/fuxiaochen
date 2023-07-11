import Link from 'next/link';

import { EmptyPage } from '@/components/client';
import { NoDataIllustration } from '@/components/rsc';
import { Button } from '@/components/ui/button';

export default function EmptyArticleList() {
  return (
    <EmptyPage
      illustration={
        <NoDataIllustration className="w-[320px] h-[320px] sm:w-[500px] sm:h-[500px]" />
      }
      title="啊噢，还没有文章呢~"
      className="h-[calc(100vh-380px)]"
      bottomOptionNode={
        <>
          <Link href="/admin/create-article">
            <Button size={'lg'}>去创建</Button>
          </Link>
          <Link href="/" className="ml-8">
            <Button size={'lg'}>回首页</Button>
          </Link>
        </>
      }
    />
  );
}
