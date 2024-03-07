import * as React from 'react';

import Link from 'next/link';

import { PATHS } from '@/config';

import { Button } from '@/components/ui/button';

import { IllustrationNotFound } from '@/components/illustrations';

export default function NotFoundPage() {
  return (
    <div className="h-screen grid place-items-center">
      <div className="grid gap-8">
        <IllustrationNotFound className="w-[400px] h-[400px]" />
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center">
          页面未找到
        </h3>
        <Button asChild>
          <Link href={PATHS.SITE_HOME}>返回首页</Link>
        </Button>
      </div>
    </div>
  );
}
