import React from 'react';

import { PATHS, PATHS_MAP } from '@/config';

import { IllustrationConstruction } from '@/components/illustrations';

export const AdminHomePage = () => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-4xl md:text-5xl font-bold mb-2">
        {PATHS_MAP[PATHS.ADMIN_HOME]}
      </h2>
      <p className="text-lg text-muted-foreground">欢迎回来，要努力学习嗷～</p>

      <div className="grid place-content-center mt-[18vh]">
        <IllustrationConstruction className="w-[320px] h-[320px]" />
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center">
          开发中
        </h3>
      </div>
    </div>
  );
};
