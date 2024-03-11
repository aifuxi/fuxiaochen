'use client';

import Link from 'next/link';

import { useScroll } from 'ahooks';
import { GithubIcon } from 'lucide-react';

import { NICKNAME, PATHS, SOURCE_CODE_GITHUB_PAGE, WEBSITE } from '@/config';

import { cn } from '@/lib/utils';

import { MobileNav } from './mobile-nav';
import { NavList } from './nav-list';

import { IconLogo } from '../icons';
import { NextLink } from '../next-link';
import { SwitchTheme } from '../switch-theme';
import { Button } from '../ui/button';

export const Navbar = () => {
  const scroll = useScroll(window.document);

  return (
    <header
      className={cn(
        'w-full sticky top-0 backdrop-blur transition-[background-color,border-width]  flex justify-center',
        (scroll?.top ?? 0) > 60 && 'bg-background/50 border-b border-border/50',
      )}
    >
      <div className="w-full flex items-center h-16 p-4 sm:p-8 max-w-screen-xl">
        <NextLink
          href={PATHS.SITE_HOME}
          className={cn('mr-4 hidden sm:flex')}
          aria-label={NICKNAME}
        >
          <IconLogo />
          <span className="ml-2 font-semibold text-primary text-base">
            {WEBSITE}
          </span>
        </NextLink>
        <NavList />
        <MobileNav />
        <div className="flex flex-1 sm:flex-none justify-end items-center gap-1">
          <SwitchTheme />

          <Link
            href={SOURCE_CODE_GITHUB_PAGE}
            target="_blank"
            aria-label={SOURCE_CODE_GITHUB_PAGE}
          >
            <Button variant="ghost" size={'icon'} aria-label="Github Icon">
              <GithubIcon size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
