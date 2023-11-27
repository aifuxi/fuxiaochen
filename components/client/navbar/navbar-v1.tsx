'use client';

import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { IconBilibili, IconGithub, IconJuejin, Logo } from '@/components/rsc';
import { BILIBILI_PAGE, GITHUB_PAGE, JUEJIN_PAGE } from '@/constants';
import { cn } from '@/utils';

const baseNavItems: NavItem[] = [
  {
    label: '首页',
    link: '/',
  },
  {
    label: '文章',
    link: '/articles',
  },
  {
    label: '标签',
    link: '/tags',
  },
  // {
  //   label: '视频',
  //   link: '/videos',
  // },
  // {
  //   label: '项目',
  //   link: '/projects',
  // },

  // {
  //   label: '留言',
  //   link: '/message-board',
  // },
  // {
  //   label: '日志',
  //   link: '/logs',
  // },
  // {
  //   label: '归档',
  //   link: '/archive',
  // },
  {
    label: '关于',
    link: '/about',
  },
];

const NavbarV1 = () => {
  const pathname = usePathname();
  return (
    <div
      className={cn(
        'fixed inset-y-12 z-10 hidden lg:hidden flex-col items-center',
        'left-0 xl:left-4 2xl:left-12',
      )}
    >
      <Logo />
      <div className="flex-1">
        <div className="mt-16 grid gap-y-4">
          {baseNavItems.map((item) => (
            <Link
              key={item.link}
              href={item.link}
              className={cn(
                'cyberpunk-clip text-primary/50 px-4 py-8',
                'hover:text-primary-foreground hover:bg-primary hover:font-semibold',
                pathname === item.link && [
                  'text-primary-foreground bg-primary font-semibold',
                ],
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="text-primary/50 grid place-content-center gap-y-4 text-2xl">
        <Link
          target="_blank"
          href={GITHUB_PAGE}
          className={cn('transition-all', 'hover:text-primary hover:scale-110')}
        >
          <IconGithub />
        </Link>
        <Link
          target="_blank"
          href={JUEJIN_PAGE}
          className="transition-all hover:scale-110 hover:text-[#1e80ff]"
        >
          <IconJuejin />
        </Link>
        <Link
          target="_blank"
          href={BILIBILI_PAGE}
          className="transition-all hover:scale-110 hover:text-[#00aeec]"
        >
          <IconBilibili />
        </Link>
      </div>
    </div>
  );
};

export default NavbarV1;
