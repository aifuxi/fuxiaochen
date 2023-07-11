'use client';

import { useBoolean } from 'ahooks';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Logo } from '@/components/rsc';
import { NavItem } from '@/types';
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
  //   label: '日志',
  //   link: '/logs',
  // },
  {
    label: '关于',
    link: '/about',
  },
];

export default function Navbar() {
  const [state, { setTrue, setFalse }] = useBoolean(false);
  const pathname = usePathname();

  return (
    <div className="py-10 flex justify-between items-center sticky top-0 z-10 bg-white">
      <Logo />
      <button className="md:hidden">
        <Menu size={40} onClick={setTrue} />
      </button>

      <ul className={cn('hidden md:flex md:space-x-6')}>
        {baseNavItems.map((item) => (
          <li key={item.link}>
            <Link
              href={item.link}
              className={cn(
                'flex items-center h-[56px] text-xl font-semibold underline-offset-4 tracking-widest text-gray-500 transition-colors ',
                'hover:text-gray-800 hover:underline',
                pathname === item.link && 'text-gray-800 underline',
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div
        className={cn(
          'fixed top-0 left-0 z-50 w-full h-full transform opacity-95 bg-gray-200 duration-300 ease-in-out',
          state ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="py-12 pr-4 flex items-center justify-end">
          <button onClick={setFalse}>
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
