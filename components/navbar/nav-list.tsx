'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/utils/helper';

import { PATHS } from '@/constants/path';

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
];

export function NavList() {
  const pathname = usePathname();

  return (
    <nav className="h-16 flex-1 hidden sm:flex items-center gap-6 text-base font-medium mr-8">
      {navItems.map((el) => (
        <Link
          key={el.link}
          href={el.link}
          className={cn(
            'transition-colors h-full items-center hidden sm:flex text-primary hover:text-primary/80 px-2.5',
            pathname === el.link ? 'font-semibold' : '',
          )}
        >
          {el.label}
        </Link>
      ))}
    </nav>
  );
}
