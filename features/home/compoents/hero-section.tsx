'use client';

import React from 'react';

import Link from 'next/link';

import { motion } from 'framer-motion';

import {
  BILIBILI_PAGE,
  BRAND_COLOR_BILIBILI,
  BRAND_COLOR_GOLANG,
  BRAND_COLOR_JUEJIN,
  BRAND_COLOR_REACT,
  BRAND_COLOR_TYPESCRIPT,
  EMAIL,
  GITHUB_PAGE,
  HERO_SECTION_CONTAINER_VARIANTS,
  HERO_SECTION_ITEM_VARIANTS,
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

export const HeroSection = () => {
  return (
    <motion.div
      variants={HERO_SECTION_CONTAINER_VARIANTS}
      initial="hidden"
      animate="visible"
      className="min-w-screen-md gap-5 flex flex-col justify-center min-h-full "
    >
      <motion.p
        variants={HERO_SECTION_ITEM_VARIANTS}
        className="text-5xl tracking-widest"
      >
        你好，我是
      </motion.p>
      <motion.strong
        variants={HERO_SECTION_ITEM_VARIANTS}
        className={`text-8xl tracking-widest font-black text-[${BRAND_COLOR_TYPESCRIPT}] bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500`}
        style={{
          WebkitTextFillColor: 'transparent',
        }}
      >
        {NICKNAME}
      </motion.strong>
      <motion.div variants={HERO_SECTION_ITEM_VARIANTS}>
        <TypeIntro />
      </motion.div>
      <motion.p
        variants={HERO_SECTION_ITEM_VARIANTS}
        className="text-5xl tracking-widest"
      >
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
      </motion.p>
      <motion.p
        variants={HERO_SECTION_ITEM_VARIANTS}
        className="text-2xl text-muted-foreground tracking-widest"
      >
        我在这个网站记录我的成长，正在努力 💪 成为一个更好的程序员。
      </motion.p>
      <motion.div
        className="flex space-x-4"
        variants={HERO_SECTION_ITEM_VARIANTS}
      >
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
      </motion.div>

      <motion.ul
        className="flex space-x-4"
        variants={HERO_SECTION_CONTAINER_VARIANTS}
        initial="hidden"
        animate="visible"
      >
        {socialMediaList.map((el) => (
          <motion.li key={el.link} variants={HERO_SECTION_ITEM_VARIANTS}>
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
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
};
