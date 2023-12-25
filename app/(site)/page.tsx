import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';

import { cn } from '@/utils/helper';

import { NICKNAME } from '@/constants/info';
import { PATHS } from '@/constants/path';

import { AboutMe } from './_components/about-me';
import { CodeBlock } from './_components/code-block';
import { MyKillsets } from './_components/my-killsets';
import { ThingsILove } from './_components/things-i-love';

export default function HomePage() {
  return (
    <div className="container pt-20">
      <div className="flex flex-col lg:flex-row lg:justify-between items-center">
        <div className="flex-1 grid gap-2 pb-8 md:pb-0">
          <p className="text-muted-foreground tracking-widest">你好，我是</p>
          <strong className="text-5xl tracking-widest">{NICKNAME}</strong>
          <p className="text-xl text-muted-foreground tracking-widest">
            一名前端开发工程师
          </p>
          <p className="text-sm text-muted-foreground tracking-widest">
            在这个网站记录我的成长，努力成为一个更好的程序员。
          </p>
          <div className="my-8">
            <Link
              href={PATHS.SITE_ARTICLES}
              className={cn(
                buttonVariants({ variant: 'default' }),
                'px-8 font-semibold',
              )}
            >
              👉 查看全部文章
            </Link>
          </div>
        </div>
        <div className="flex-1 w-full flex justify-center">
          <CodeBlock />
        </div>
      </div>

      <ThingsILove />

      <AboutMe />

      <MyKillsets />
    </div>
  );
}
