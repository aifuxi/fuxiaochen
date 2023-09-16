'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils';

type Props = {
  illustration: React.ReactNode;
  title: string;
  className?: string;
  bottomOptionNode?: React.ReactNode;
};

export default function EmptyPage({
  illustration,
  title,
  className,
  bottomOptionNode = (
    <Link href="/">
      <Button size={'lg'}>返回首页</Button>
    </Link>
  ),
}: Props) {
  return (
    <div
      className={cn(
        'flex h-[calc(100vh-136px)] flex-col items-center justify-center',
        className,
      )}
    >
      {illustration}
      <h2 className="text-center text-3xl font-black md:text-5xl xl:text-6xl">
        {title}
      </h2>
      <div className="mt-10">{bottomOptionNode}</div>
    </div>
  );
}
