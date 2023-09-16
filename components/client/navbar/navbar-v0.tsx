'use client';

import { useBoolean } from 'ahooks';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Logo } from '@/components/rsc';
import { cn } from '@/utils';

import ThemeSwitcher from '../theme-switcher';

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

  {
    label: '留言',
    link: '/message-board',
  },
  {
    label: '日志',
    link: '/logs',
  },
  {
    label: '归档',
    link: '/archive',
  },
  {
    label: '关于',
    link: '/about',
  },
];

export default function NavbarV0() {
  const [state, { setTrue, setFalse }] = useBoolean(false);
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'sticky top-0 z-10 flex items-center justify-between py-10 ',
        'bg-white dark:bg-gray-900',
      )}
    >
      <Logo />

      <div className="flex items-center">
        <ul className={cn('hidden md:flex md:space-x-6')}>
          {baseNavItems.map((item) => (
            <li key={item.link}>
              <Link
                href={item.link}
                className={cn(
                  'flex h-[56px] items-center  font-semibold tracking-widest underline-offset-4  transition-colors ',
                  'hover:text-gray-800 hover:underline dark:hover:text-white',
                  'text-gray-500 dark:text-gray-400',
                  pathname === item.link &&
                    'text-gray-800 underline dark:text-white',
                  'text-lg lg:text-xl',
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <ThemeSwitcher className="ml-4" />

        <button className="ml-4 md:hidden">
          <Menu size={36} onClick={setTrue} />
        </button>
      </div>

      <div
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-full bg-gray-200 opacity-95 duration-300 ease-in-out',
          state ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-end py-12 pr-4">
          <button onClick={setFalse} className="text-gray-900">
            <X size={40} />
          </button>
        </div>
        <ul className="flex flex-col space-y-8 px-12">
          {baseNavItems.map((item) => (
            <li key={item.link}>
              <Link
                href={item.link}
                onClick={setFalse}
                className="text-2xl font-bold tracking-widest text-gray-900"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
