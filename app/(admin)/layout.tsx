'use client';

import React from 'react';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  HomeIcon,
  LetterCaseCapitalizeIcon,
  ReaderIcon,
} from '@radix-ui/react-icons';
import { Badge, Text } from '@radix-ui/themes';

import { PageLoading } from '@/components/loading';
import { PATHS } from '@/constants';

const adminNavItems: Array<{
  label: string;
  link: string;
  icon?: React.ReactNode;
}> = [
  {
    label: 'Dashboard',
    link: PATHS.ADMIN_HOME,
    icon: <HomeIcon className="w-[18px] h-[18px]" />,
  },
  {
    label: '文章管理',
    link: PATHS.ADMIN_ARTICLE,
    icon: <ReaderIcon className="w-[18px] h-[18px]" />,
  },
  {
    label: '标签管理',
    link: PATHS.ADMIN_TAG,
    icon: <LetterCaseCapitalizeIcon className="w-[18px] h-[18px]" />,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  return (
    <div className="flex">
      <div className="min-w-[256px] max-w-[256px] h-screen  bg-gray-1 flex-col flex p-2 gap-2">
        {session?.user?.image && (
          <img src={session?.user?.image} alt={session?.user?.name ?? ''} />
        )}

        {adminNavItems.map((el) => (
          <Link key={el.link} href={el.link}>
            <Badge
              size={'2'}
              color={'gray'}
              variant={pathname === el.link ? 'solid' : 'soft'}
              highContrast={pathname === el.link}
              className="w-full !cursor-pointer"
            >
              {el.icon}
              <Text size={'4'}>{el.label}</Text>
            </Badge>
          </Link>
        ))}
      </div>
      <div className="h-screen overflow-scroll flex flex-1 p-8 flex-col">
        {renderChildren()}
      </div>
    </div>
  );

  function renderChildren() {
    if (status === 'loading') {
      return <PageLoading />;
    }

    return children;
  }
}
