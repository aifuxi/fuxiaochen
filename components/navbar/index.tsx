import Link from 'next/link';

import { GithubIcon } from 'lucide-react';

import { cn } from '@/utils/helper';

import { GITHUB_PAGE, NICKNAME, PATHS } from '@/config';

import { MobileNav } from './mobile-nav';
import { NavList } from './nav-list';

import { IconLogo } from '../icons';
import { SwitchTheme } from '../switch-theme';
import { Button } from '../ui/button';

export function Navbar() {
  return (
    <header className="w-full sticky top-0 bg-background z-10 flex justify-center">
      <div className="w-full flex items-center h-16 p-4 sm:p-8 max-w-screen-xl">
        <Link
          href={PATHS.SITE_HOME}
          className={cn('mr-4 hidden sm:flex')}
          aria-label={NICKNAME}
        >
          <IconLogo className="w-10 h-10" />
        </Link>
        <NavList />
        <MobileNav />
        <div className="flex flex-1 sm:flex-none justify-end items-center gap-1">
          <SwitchTheme />

          <Link href={GITHUB_PAGE} target="_blank" aria-label={GITHUB_PAGE}>
            <Button variant="ghost" size={'icon'} aria-label="Github Icon">
              <GithubIcon size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export { SideNav } from './side-nav';
