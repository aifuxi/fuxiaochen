'use client';

import React from 'react';

import Link from 'next/link';

import { useScroll } from 'ahooks';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

import { NICKNAME, PATHS, SOURCE_CODE_GITHUB_PAGE, WEBSITE } from '@/constants';
import { cn } from '@/lib/utils';

import { navItems } from './config';
import { MobileNav } from './mobile-nav';

import { IconBaranGithub, IconLogoFuXiaoChen } from '../icons';
import { NextLink } from '../next-link';
import { SwitchTheme } from '../switch-theme';
import { Button } from '../ui/button';

export const Navbar = () => {
  const scroll = useScroll(document);

  return (
    <header
      className={cn(
        'w-full sticky top-0 backdrop-blur transition-[background-color,border-width]  flex justify-center z-50',
        (scroll?.top ?? 0) > 60 && 'bg-background/50 border-b border-border/50',
      )}
    >
      <div className="w-full flex items-center h-16 p-4 sm:p-8 max-w-screen-xl">
        <NextLink
          href={PATHS.SITE_HOME}
          className={cn('mr-4 hidden sm:flex')}
          aria-label={NICKNAME}
        >
          <IconLogoFuXiaoChen />
          <span className="ml-2 font-semibold text-primary text-base">
            {WEBSITE}
          </span>
        </NextLink>
        <div className="h-16 flex-1 hidden sm:flex justify-end items-center gap-6 text-base font-medium mr-8">
          <NavigationMenu className="list-none">
            {navItems.map((el) => (
              <NavigationMenuItem key={el.link}>
                <Link href={el.link} legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {el.label}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenu>
        </div>
        <MobileNav />
        <div className="flex flex-1 sm:flex-none justify-end items-center gap-1">
          <SwitchTheme />

          <Link
            href={SOURCE_CODE_GITHUB_PAGE}
            target="_blank"
            aria-label={SOURCE_CODE_GITHUB_PAGE}
          >
            <Button variant="ghost" size={'icon'} aria-label="Github Icon">
              <IconBaranGithub className="text-base" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
