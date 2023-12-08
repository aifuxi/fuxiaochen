'use client';

import React from 'react';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { BookText, HomeIcon, Tags } from 'lucide-react';

import { PageLoading } from '@/components/loading';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PATHS } from '@/constants/path';
import { cn } from '@/utils/helper';

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
    icon: <BookText className="w-[18px] h-[18px]" />,
  },
  {
    label: '标签管理',
    link: PATHS.ADMIN_TAG,
    icon: <Tags className="w-[18px] h-[18px]" />,
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
      <div className="min-w-[256px] max-w-[256px] h-screen bg-foreground flex-col flex items-center p-2 gap-2">
        {session?.user?.image ? (
          <img
            src={session?.user?.image}
            className="border w-[200px] h-[200px]  my-6"
            alt={session?.user?.name ?? ''}
          />
        ) : (
          <Skeleton className="w-[200px] h-[200px] my-6" />
        )}

        {adminNavItems.map((el) => (
          <Link
            key={el.link}
            href={el.link}
            className={cn(
              buttonVariants({
                variant: pathname === el.link ? 'secondary' : 'default',
              }),
              'text-md px-4 py-2 !rounded-none flex gap-2 items-center !justify-start w-full',
            )}
          >
            {el.icon}
            <span>{el.label}</span>
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
