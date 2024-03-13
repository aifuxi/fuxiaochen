'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { PATHS, PATHS_MAP } from '@/config';

import { cn } from '@/lib/utils';

export const navItems: Array<{
  label?: string;
  link: string;
  external?: boolean;
}> = [
  {
    label: PATHS_MAP[PATHS.SITE_HOME],
    link: PATHS.SITE_HOME,
  },
  {
    label: PATHS_MAP[PATHS.SITE_BLOG],
    link: PATHS.SITE_BLOG,
  },
  {
    label: PATHS_MAP[PATHS.SITE_SNIPPET],
    link: PATHS.SITE_SNIPPET,
  },
];

export function NavList() {
  const pathname = usePathname();

  return (
    <nav className="h-16 flex-1 hidden sm:flex justify-end items-center gap-6 text-base font-medium mr-8">
      {navItems.map((el) => (
        <Link
          key={el.link}
          href={el.link}
          className={cn(
            'transition-colors h-full items-center hover:text-foreground/80 hidden sm:flex',
            pathname === el.link
              ? 'text-foreground font-semibold'
              : 'text-foreground/60',
          )}
        >
          {el.label}
        </Link>
      ))}
    </nav>
  );
}
