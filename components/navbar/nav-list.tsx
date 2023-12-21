'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/utils/helper';

import { NICKNAME } from '@/constants/info';
import { PATHS } from '@/constants/path';

import { IconLogo } from '../icons/icon-logo';

export const navItems: Array<{
  label: string;
  link: string;
  external?: boolean;
}> = [
  {
    label: '首页',
    link: PATHS.SITE_HOME,
  },
  {
    label: '文章',
    link: PATHS.SITE_ARTICLES,
  },
  {
    label: '标签',
    link: PATHS.SITE_TAGS,
  },
  {
    label: '留言板',
    link: PATHS.SITE_MESSAGE_BOARD,
  },
];

export function NavList() {
  const pathname = usePathname();

  return (
    <nav className="h-full flex items-center gap-6 text-base font-medium">
      <Link
        href={PATHS.SITE_HOME}
        className={cn('mr-4 hidden sm:flex')}
        aria-label={NICKNAME}
      >
        <IconLogo className="w-8 h-8" />
      </Link>

      {navItems.map((el) => (
        <Link
          key={el.link}
          href={el.link}
          target={el.external ? '_blank' : '_self'}
          className={cn(
            'transition-colors hover:text-foreground/80 hidden sm:flex',
            pathname === el.link ? 'text-foreground' : 'text-foreground/60',
          )}
        >
          {el.label}
        </Link>
      ))}
    </nav>
  );
}
