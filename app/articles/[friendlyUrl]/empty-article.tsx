'use client';

import { useRouter } from 'next/navigation';

import { EmptyPage } from '@/components/client';
import { NotFound404Illustration } from '@/components/rsc';
import { Button } from '@/components/ui/button';

export default function EmptyArticle() {
  const router = useRouter();
  return (
    <EmptyPage
      illustration={
        <NotFound404Illustration className="w-[320px] h-[320px] sm:w-[500px] sm:h-[500px]" />
      }
      title="啊噢，文章不见啦~"
      bottomOptionNode={
        <Button size={'lg'} onClick={router.back}>
          返回
        </Button>
      }
    />
  );
}
