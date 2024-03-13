import Link from 'next/link';

import {
  BRAND_COLOR_GOLANG,
  BRAND_COLOR_REACT,
  BRAND_COLOR_TYPESCRIPT,
  NICKNAME,
  PATHS,
} from '@/config';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { TypeIntro } from '@/features/home';
import { cn } from '@/lib/utils';

import { socialMediaList } from './social-media';

export const HeroSectionWithCssAnimation = () => {
  return (
    <div className="min-w-screen-md gap-5 flex flex-col justify-center min-h-full ">
      <p className="text-5xl tracking-widest">你好，我是</p>
      <strong
        className={`text-8xl tracking-widest font-black text-[${BRAND_COLOR_TYPESCRIPT}] bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500`}
        style={{
          WebkitTextFillColor: 'transparent',
        }}
      >
        {NICKNAME}
      </strong>
      <div>
        <TypeIntro />
      </div>
      <p className="text-5xl tracking-widest">
        喜欢
        <span className={`font-semibold text-[${BRAND_COLOR_REACT}]`}>
          React
        </span>
        、
        <span className={`font-semibold text-[${BRAND_COLOR_TYPESCRIPT}]`}>
          TypeScript
        </span>
        和
        <span className={`font-semibold text-[${BRAND_COLOR_GOLANG}]`}>
          Golang
        </span>
        <span className="ml-4">\owo/ ~</span>
      </p>
      <p className="text-2xl text-muted-foreground tracking-widest">
        我在这个网站记录我的成长，正在努力 💪 成为一个更好的程序员。
      </p>
      <div className="flex space-x-4">
        <Link
          href={PATHS.SITE_ARTICLES}
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          Read The Blog
        </Link>
        <Link
          href={PATHS.SITE_ARTICLES}
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          About Me
        </Link>
      </div>

      <ul className="flex space-x-4">
        {socialMediaList.map((el) => (
          <li key={el.link}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant="outline" size="icon">
                  <Link href={el.link} target="_blank">
                    {el.icon}
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{el.label}</TooltipContent>
            </Tooltip>
          </li>
        ))}
      </ul>
    </div>
  );
};
