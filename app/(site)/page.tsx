/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';

import { HomeRect } from '@/components/rect';

import { cn } from '@/utils/helper';

import { NICKNAME } from '@/constants/info';
import { PATHS } from '@/constants/path';

export default function HomePage() {
  return (
    <div className="container pt-20">
      <HomeRect className="absolute lg:right-0 -right-1/3  z-[-1] -top-48 lg:top-0 w-3/5  lg:w-2/5" />

      <div className="flex flex-col lg:flex-row lg:justify-between items-center min-h-[calc(100vh-64px)] ">
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
          <pre className="shadow-2xl text-xs sm:text-sm lg:text-base max-w-max">
            <code className="hljs language-typescript">
              <span className="hljs-keyword">class</span>{' '}
              <span className="hljs-title class_">Person</span> {'{'}
              {'\n'}
              {'  '}
              <span className="hljs-attr">nickname</span>:{' '}
              <span className="hljs-built_in">string</span>;{'\n'}
              {'  '}
              <span className="hljs-attr">gender</span>:{' '}
              <span className="hljs-string">'male'</span> |{' '}
              <span className="hljs-string">'female'</span>;{'\n'}
              {'  '}
              <span className="hljs-attr">age</span>:{' '}
              <span className="hljs-built_in">number</span>;{'\n'}
              {'  '}
              <span className="hljs-attr">skills</span>:{' '}
              <span className="hljs-title class_">Array</span>&lt;
              <span className="hljs-built_in">string</span>&gt;;{'\n'}
              {'  '}
              <span className="hljs-attr">location</span>:{' '}
              <span className="hljs-built_in">string</span>;{'\n'}
              {'\n'}
              {'  '}
              <span className="hljs-title function_">constructor</span>(
              <span className="hljs-params" />) {'{'}
              {'\n'}
              {'    '}
              <span className="hljs-variable language_">this</span>.
              <span className="hljs-property">nickname</span> ={' '}
              <span className="hljs-string font-semibold">'F西'</span>;{'\n'}
              {'    '}
              <span className="hljs-variable language_">this</span>.
              <span className="hljs-property">gender</span> ={' '}
              <span className="hljs-string">'male'</span>;{'\n'}
              {'    '}
              <span className="hljs-variable language_">this</span>.
              <span className="hljs-property">age</span> ={' '}
              <span className="hljs-keyword">new</span>{' '}
              <span className="hljs-title class_">Date</span>().
              <span className="hljs-title function_">getFullYear</span>() -{' '}
              <span className="hljs-number">1999</span>;{'\n'}
              {'    '}
              <span className="hljs-variable language_">this</span>.
              <span className="hljs-property">skills</span> = [{'\n'}
              {'        '}
              <span className="hljs-string font-semibold">'React'</span>,{'\n'}
              {'        '}
              <span className="hljs-string font-semibold">'TypeScript'</span>,
              {'\n'}
              {'        '}
              <span className="hljs-string font-semibold">'JavaScript'</span>,
              {'\n'}
              {'        '}
              <span className="hljs-string font-semibold">'Tailwind CSS'</span>
              {'\n'}
              {'    '}];{'\n'}
              {'    '}
              <span className="hljs-variable language_">this</span>.
              <span className="hljs-property">location</span> ={' '}
              <span className="hljs-string">'上海'</span>;{'\n'}
              {'  '}
              {'}'}
              {'\n'}
              {'}'}
              {'\n'}
              {'\n'}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
