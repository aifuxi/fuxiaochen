import Link from 'next/link';

import { GithubIcon } from 'lucide-react';

import { NavList } from './nav-list';
import { GITHUB_PAGE } from '@/constants/info';

import { SwitchTheme } from '../switch-theme';
import { Button } from '../ui/button';

export function Navbar() {
  return (
    <header className="border-b w-full sticky top-0 bg-background z-10">
      <div className="container flex h-16">
        <NavList />

        <div className="flex-1 flex justify-end items-center gap-1">
          <SwitchTheme />

          <Link href={GITHUB_PAGE} target="_blank">
            <Button variant="ghost" size={'icon'}>
              <GithubIcon size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export { SideNav } from './side-nav';
