import React from 'react';

import { IconBike, IconCode, IconGame } from '@/components/icons';

type Hobby = {
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
};

const hobbies: Hobby[] = [
  {
    icon: <IconCode />,
    title: 'Coding',
    description: '写代码什么的最酷了',
  },
  {
    icon: <IconBike />,
    title: '骑行',
    description: '骑车使我快乐，嗷呜~',
  },
  {
    icon: <IconGame />,
    title: '游戏',
    description: '又菜又爱玩，哈哈',
  },
];

export function ThingsILove() {
  return (
    <div className="container pt-48 flex flex-col items-center gap-6">
      <h2 className="mt-10 scroll-m-20 flex flex-col sm:flex-row text-3xl font-semibold tracking-widest transition-colors first:mt-0">
        <span>我喜欢做的事</span>
        <span className="hidden sm:inline-flex">/</span>
        <span>Things I love</span>
      </h2>
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-8">
        {hobbies.map((el) => (
          <div
            key={el.title}
            className="col-span-1 grid place-items-center gap-4 pb-12 pt-8"
          >
            <div className="grid place-items-center w-[100px] h-[100px] bg-foreground text-background text-6xl">
              {el.icon}
            </div>
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              {el.title}
            </h3>
            <div className="text-sm text-muted-foreground">
              {el.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
