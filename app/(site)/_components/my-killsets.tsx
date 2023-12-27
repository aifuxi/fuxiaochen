import React from 'react';

import {
  IconCSS,
  IconHTML,
  IconJavaScript,
  IconNextjs,
  IconNodejs,
  IconReact,
  IconTailwindCSS,
  IconTypeScript,
} from '@/components/icons';

type Skill = {
  icon: React.ReactNode;
  key: string;
};

const skillsets: Skill[] = [
  {
    icon: <IconHTML />,
    key: 'html',
  },
  {
    icon: <IconCSS />,
    key: 'css',
  },
  {
    icon: <IconJavaScript />,
    key: 'js',
  },
  {
    icon: <IconTypeScript />,
    key: 'ts',
  },
  {
    icon: <IconTailwindCSS />,
    key: 'tailwindcss',
  },
  {
    icon: <IconReact />,
    key: 'react',
  },
  {
    icon: <IconNodejs />,
    key: 'nodejs',
  },
  {
    icon: <IconNextjs />,
    key: 'nextjs',
  },
];

export function MyKillsets() {
  return (
    <div className="container py-20 flex flex-col items-center">
      <h2 className="mt-10 scroll-m-20 flex flex-col sm:flex-row text-3xl font-semibold tracking-widest transition-colors first:mt-0">
        <span>我的技术栈</span>
        <span className="hidden sm:inline-flex">/</span>
        <span>My Skillsets</span>
      </h2>

      <div className="w-full grid grid-cols-2 sm:grid-cols-4 py-24 gap-8 sm:gap-16">
        {skillsets.map((el) => (
          <div key={el.key} className="grid place-items-center text-[80px]">
            {el.icon}
          </div>
        ))}
      </div>
    </div>
  );
}
