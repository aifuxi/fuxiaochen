import Link from 'next/link';

import { cn } from '@/utils/helper';

import { NICKNAME } from '@/constants/info';
import { PATHS } from '@/constants/path';

import { MobileNav } from './mobile-nav';
import { NavList } from './nav-list';

export function Navbar() {
  return (
    <header className="w-full sticky top-0 bg-background z-10 shadow-lg">
      <div className="flex items-center h-16 py-4 px-10 sm:p-8">
        <Link
          href={PATHS.SITE_HOME}
          className={cn('mr-4 hidden sm:flex w-[240px]')}
          aria-label={NICKNAME}
        >
          <img src="/fuxiaochen-logo.svg" alt={NICKNAME} className="h-[30px]" />
        </Link>
        <NavList />
        <MobileNav />
      </div>
    </header>
  );
}

export { SideNav } from './side-nav';
