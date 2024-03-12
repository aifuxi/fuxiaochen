import React from 'react';

import Link from 'next/link';

import {
  BILIBILI_PAGE,
  BRAND_COLOR_BILIBILI,
  BRAND_COLOR_GOLANG,
  BRAND_COLOR_JUEJIN,
  BRAND_COLOR_REACT,
  BRAND_COLOR_TYPESCRIPT,
  EMAIL,
  GITHUB_PAGE,
  JUEJIN_PAGE,
  NICKNAME,
  PATHS,
} from '@/config';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  IconBaranGithub,
  IconBrandBilibili,
  IconLogoGmail,
  IconLogoJuejin,
} from '@/components/icons';
import { IntroScrollMouse } from '@/components/intro-scroll-mouse';

import { TypeIntro } from '@/features/home';
import { cn } from '@/lib/utils';

const socialMediaList: Array<{
  icon: React.ReactNode;
  label: string;
  link: string;
}> = [
  {
    icon: <IconBaranGithub className="text-2xl" />,
    label: 'Github',
    link: GITHUB_PAGE,
  },
  {
    icon: <IconLogoGmail className="text-lg" />,
    label: 'Gmail',
    link: `mailto:${EMAIL}`,
  },
  {
    icon: (
      <IconBrandBilibili
        className={`text-2xl transition-colors text-[${BRAND_COLOR_BILIBILI}]`}
      />
    ),
    label: 'Bilibili',
    link: BILIBILI_PAGE,
  },
  {
    icon: (
      <IconLogoJuejin
        className={`text-2xl transition-colors text-[${BRAND_COLOR_JUEJIN}]`}
      />
    ),
    label: '掘金',
    link: JUEJIN_PAGE,
  },
];

export default function HomePage() {
  return (
    <div>
      <div className="h-[calc(100vh-64px)] grid place-content-center relative">
        <div className="min-w-screen-md gap-5 flex flex-col justify-center min-h-full ">
          <p className="text-5xl tracking-widest">你好，我是</p>
          <strong
            className="text-8xl tracking-widest font-black"
            style={{
              background: `linear-gradient(to right, ${BRAND_COLOR_REACT}, ${BRAND_COLOR_TYPESCRIPT}, ${BRAND_COLOR_GOLANG}) text`,
              WebkitTextFillColor: 'transparent',
            }}
          >
            {NICKNAME}
          </strong>
          <TypeIntro />
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
        <div className="grid place-content-center absolute bottom-12 inset-x-0">
          <IntroScrollMouse />
        </div>
      </div>
    </div>
  );
}
