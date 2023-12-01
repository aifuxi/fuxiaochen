import React from 'react';

import { Flex } from '@radix-ui/themes';

import { NavLink } from './nav-link';
import { PATHS } from '@/constants/path';

import { Logo } from '../logo';

const navItems: Array<{
  label: string;
  link: string;
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
  {
    label: '关于',
    link: PATHS.SITE_ABOUT,
  },
];

export function Navbar() {
  return (
    <nav className="w-32 h-screen flex flex-col items-center pt-24">
      <Logo />

      <Flex direction={'column'} gap={'4'} justify={'center'} mt={'9'}>
        {navItems.map((el) => {
          return <NavLink key={el.link} el={el} />;
        })}
      </Flex>
    </nav>
  );
}
