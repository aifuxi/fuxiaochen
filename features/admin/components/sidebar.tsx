'use client';

import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  IconSolarBook,
  IconSolarChartSquare,
  IconSolarCodeSquare,
  IconSolarHashtagSquare,
  IconSolarHomeSmile,
  IconSolarNotesBold,
} from '@/components/icons';

import { PATHS, PATHS_MAP } from '@/constants';
import { cn } from '@/lib/utils';

const adminNavItems: Array<{
  label?: string;
  link: string;
  icon?: React.ReactNode;
}> = [
  {
    label: PATHS_MAP[PATHS.ADMIN_HOME],
    link: PATHS.ADMIN_HOME,
    icon: <IconSolarHomeSmile className="text-lg" />,
  },
  {
    label: PATHS_MAP[PATHS.ADMIN_STATISTIC],
    link: PATHS.ADMIN_STATISTIC,
    icon: <IconSolarChartSquare className="text-lg" />,
  },
  {
    label: PATHS_MAP[PATHS.ADMIN_TAG],
    link: PATHS.ADMIN_TAG,
    icon: <IconSolarHashtagSquare className="text-lg" />,
  },
  {
    label: PATHS_MAP[PATHS.ADMIN_BLOG],
    link: PATHS.ADMIN_BLOG,
    icon: <IconSolarBook className="text-lg" />,
  },
  {
    label: PATHS_MAP[PATHS.ADMIN_SNIPPET],
    link: PATHS.ADMIN_SNIPPET,
    icon: <IconSolarCodeSquare className="text-lg" />,
  },
  {
    label: PATHS_MAP[PATHS.ADMIN_NOTE],
    link: PATHS.ADMIN_NOTE,
    icon: <IconSolarNotesBold className="text-lg" />,
  },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return adminNavItems.map((el) => (
    <Link
      key={el.link}
      href={el.link}
      className={cn(
        'w-full flex items-center space-x-4 px-4 py-2 rounded-lg',
        'hover:bg-secondary',
        pathname === el.link ? 'bg-secondary' : '',
      )}
    >
      {el.icon}
      <span className={cn(pathname === el.link ? 'font-semibold' : '')}>
        {el.label}
      </span>
    </Link>
  ));
};
