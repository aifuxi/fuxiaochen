import React from 'react';

import { Metadata } from 'next';
import Image from 'next/image';

import { PageTitle, SocialInfo } from '@/components/rsc';
import { NICKNAME } from '@/constants';
import { cn } from '@/utils';

export const metadata: Metadata = {
  title: '关于',
};

export default function AboutPage() {
  return (
    <div className="flex flex-col space-y-8">
      <PageTitle title="关于" />

      <div className="flex flex-col items-center space-y-2">
        <Image
          src="https://aifuxi.oss-cn-shanghai.aliyuncs.com/self/avatar.jpeg"
          width={180}
          height={180}
          className="border rounded-full"
          alt={NICKNAME}
        />
        <h3 className="text-2xl font-bold leading-8 tracking-tight">
          {NICKNAME}
        </h3>
        <div className="text-gray-500 dark:text-gray-400">前端工程师</div>
        <blockquote
          className={cn(' italic indent-8', 'text-gray-500 dark:text-gray-400')}
        >
          学习的时候要带着自己的思考，不要盲目崇拜，也不要全部照搬前人的经验和成果。只有经过自己思考，学以致用，方能在属于自己的蛊仙(程序员)之路上走的更远！
        </blockquote>
        <div
          className={cn(
            'w-full text-right italic text-xs',
            'text-gray-500 dark:text-gray-400 ',
          )}
        >
          forked from 大爱仙尊-古月方源
        </div>
      </div>

      <SocialInfo />

      <div className="prose max-w-none dark:prose-invert">
        <ul>
          <li>昵称：F西</li>
          <li>
            简介：我是一名前端工程师，但是对后端也很感兴趣，两者都持续学习中，目标是让自己具备全栈开发的能力。在我看来，不懂后端的前端不是好前端。
          </li>
          <li>坐标：上海</li>
          <li>
            技能：
            <ul>
              <li>前端：React、Tailwind CSS、Next.js、Typescript</li>
              <li>服务端：Node.js、Linux</li>
              <li>数据库：Mysql、Postgresql</li>
              <li>其他：Webpack、Vite</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
}
