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
      <Button size={'lg'}>回首页</Button>
    </Link>
  ),
}: Props) {
  return (
    <div
      className={cn(
        'h-[calc(100vh-136px)] flex flex-col justify-center items-center',
        className,
      )}
    >
      {illustration}
      <h2 className="text-3xl md:text-5xl xl:text-6xl font-black text-center">
        {title}
      </h2>
      <div className="mt-10">{bottomOptionNode}</div>
    </div>
  );
}
