'use client';

import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { EmailDialog } from '@/components/client';
import {
  IconBilibili,
  IconEmail,
  IconGithub,
  IconJuejin,
  IconWechat,
  Logo,
  PreviewImage,
} from '@/components/rsc';
import { BILIBILI_PAGE, EMAIL, GITHUB_PAGE, JUEJIN_PAGE } from '@/constants';
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
        'fixed z-10 inset-y-12  flex flex-col items-center',
        'left-0 xl:left-4 2xl:left-12',
      )}
    >
      <Logo />
      <div className="flex-1">
        <div className="grid gap-y-4 mt-16">
          {baseNavItems.map((item) => (
            <Link
              key={item.link}
              href={item.link}
              className={cn(
                'px-4 py-8 cyberpunk-clip text-primary/50',
                'hover:text-primary-foreground hover:font-semibold hover:bg-primary',
                pathname === item.link && [
                  'text-primary-foreground font-semibold bg-primary',
                ],
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-y-4 place-content-center text-2xl text-primary/50">
        <EmailDialog
          triggerNode={
            <IconEmail
              className={cn(
                'transition-all',
                'cursor-pointer hover:text-primary hover:scale-110',
              )}
            />
          }
          email={EMAIL}
        />
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
          className="hover:text-[#1e80ff] transition-all hover:scale-110"
        >
          <IconJuejin />
        </Link>
        <Link
          target="_blank"
          href={BILIBILI_PAGE}
          className="hover:text-[#00aeec] transition-all hover:scale-110"
        >
          <IconBilibili />
        </Link>
        <PreviewImage
          triggerNode={
            <IconWechat className="hover:text-[#07c160] transition-all hover:scale-110 cursor-pointer" />
          }
          imageUrl="/images/wechat-qr-code.jpg"
          className="w-[500px]"
        />
      </div>
    </div>
  );
};

export default NavbarV1;
