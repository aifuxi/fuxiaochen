import Link from 'next/link';

import { NICKNAME, PATHS } from '@/config';

import { buttonVariants } from '@/components/ui/button';

import { cn } from '@/utils/helper';

export default function HomePage() {
  return (
    <div className="max-w-screen-md gap-5 flex flex-col justify-center min-h-full">
      <p className="text-muted-foreground tracking-widest">你好，我是</p>
      <strong className="text-5xl tracking-widest">{NICKNAME}</strong>
      <p className="text-xl text-muted-foreground tracking-widest">
        一名前端开发工程师
      </p>
      <p className="text-sm text-muted-foreground tracking-widest">
        在这个网站记录我的成长，努力成为一个更好的程序员。
      </p>
      <div>
        <Link
          href={PATHS.SITE_ARTICLES}
          className={cn(
            buttonVariants({ variant: 'default' }),
            'px-8 font-semibold',
          )}
        >
          👉 查看文章
        </Link>
      </div>
    </div>
  );
}
