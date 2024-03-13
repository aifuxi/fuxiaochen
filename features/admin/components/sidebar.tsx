'use client';

import * as React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { PATHS, PATHS_MAP } from '@/config';

import { Button } from '@/components/ui/button';

import {
  IconSolarBook,
  IconSolarChartSquare,
  IconSolarCodeSquare,
  IconSolarHashtagSquare,
} from '@/components/icons';

import { cn } from '@/lib/utils';

const adminNavItems: Array<{
  label?: string;
  link: string;
  icon?: React.ReactNode;
}> = [
  {
    label: PATHS_MAP[PATHS.ADMIN_HOME],
    link: PATHS.ADMIN_HOME,
    icon: <IconSolarChartSquare className="text-lg" />,
  },
  {
    label: PATHS_MAP[PATHS.ADMIN_BLOG],
    link: PATHS.ADMIN_BLOG,
    icon: <IconSolarBook className="text-lg" />,
  },
  {
    label: PATHS_MAP[PATHS.ADMIN_TAG],
    link: PATHS.ADMIN_TAG,
    icon: <IconSolarHashtagSquare className="text-lg" />,
  },
  {
    label: PATHS_MAP[PATHS.ADMIN_SNIPPET],
    link: PATHS.ADMIN_SNIPPET,
    icon: <IconSolarCodeSquare className="text-lg" />,
  },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return adminNavItems.map((el) => (
    <Link
      key={el.link}
      href={el.link}
      className="flex items-center min-w-full space-x-4"
    >
      <Button
        size="icon"
        variant={pathname === el.link ? 'default' : 'secondary'}
      >
        {el.icon}
      </Button>
      <span
        className={cn(
          'text-base transition-all text-primary font-medium',
          pathname === el.link ? 'font-semibold' : '',
        )}
      >
        {el.label}
      </span>
    </Link>
  ));
};
