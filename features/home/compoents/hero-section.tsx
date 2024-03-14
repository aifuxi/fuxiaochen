import Link from 'next/link';

import { NICKNAME, PATHS } from '@/config';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { TypeIntro } from '@/features/home';
import { cn } from '@/lib/utils';

import { socialMediaList } from './social-media';

export const HeroSection = () => {
  return (
    <div className="min-w-screen-md gap-5 flex flex-col justify-center min-h-full ">
      <p className="text-5xl tracking-widest animate-fade-down ">你好，我是</p>
      <strong
        className={cn(
          `text-8xl tracking-widest font-black  bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500`,
          'animate-fade-down  animate-delay-200',
        )}
        style={{
          WebkitTextFillColor: 'transparent',
        }}
      >
        {NICKNAME}
      </strong>
      <div className={cn('animate-fade-down  animate-delay-[400ms]')}>
        <TypeIntro />
      </div>
      <p
        className={cn(
          'text-5xl tracking-widest',
          'animate-fade-down  animate-delay-[800ms]',
        )}
      >
        喜欢
        <span className={`font-semibold text-[#00d8ff]`}>React</span>、
        <span className={`font-semibold text-[#007acc]`}>TypeScript</span>和
        <span className={`font-semibold text-[#00b4e0]`}>Golang</span>
        <span className="ml-4">\owo/ ~</span>
      </p>
      <p
        className={cn(
          'text-2xl text-muted-foreground tracking-widest',
          'animate-fade-down  animate-delay-1000',
        )}
      >
        我在这个网站记录我的成长，正在努力 💪 成为一个更好的程序员。
      </p>
      <div
        className={cn(
          'flex space-x-4',
          'animate-fade-down  animate-delay-[1200ms]',
        )}
      >
        <Link
          href={PATHS.SITE_BLOG}
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          Read The Blog
        </Link>
        <Link
          href={PATHS.SITE_BLOG}
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          About Me
        </Link>
      </div>

      <ul
        className={cn(
          'flex space-x-4',
          'animate-fade-down  animate-delay-[1400ms]',
        )}
      >
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
