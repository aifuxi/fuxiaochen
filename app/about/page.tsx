import React from 'react';

import { Metadata } from 'next';
import Image from 'next/image';

import { GiscusComment } from '@/components/client';
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
          forked from 大爱仙尊 - 古月方源
        </div>
      </div>

      <SocialInfo />

      <div className="prose max-w-none dark:prose-invert">
        <h2>简介：</h2>
        <p>
          我是F西，目前工作是前端开发，但是对后端也很感兴趣，两者都持续学习中，目标是让自己具备全栈开发的能力。在我看来，不懂后端的前端不是好前端。
        </p>
        <p />
        <h2>坐标：</h2>
        <p>上海</p>
        <h2>经历：</h2>
        <p>
          2020年毕业于南昌某不知名专科学院，学的是大数据技术与应用专业，也算是科班出身。虽然大多数人认为专科不大行，但不可否认的是，学校里的课程对我还是有一定帮助的。
        </p>
        <p>
          大一就开始学习的Linux系统基础，即便到现在，也让我在工作和日常开发中受益良多。命令行工具、vim、前后端等项目的部署无一不都需要Linux的知识。
        </p>
        <p>
          还有Python、网页设计与开发、Java、数据库技术及应用（MySQL）、Hadoop、HBase等课程的学习，也让我拓宽了不少视野，让我在工作和聊天水群提供了一定的技术基础。🤪
        </p>
        <p>
          大三，学校获批成为”1+X“Web前端开发职业技能等级证书考核站点，由此开展了免费的前端训练营。请校外的讲师来学校给我们专门讲解前端技术，让我们去考这个Web前端开发职业技能等级证书，
          对将来毕业找工作有好处。虽然找工作时公司好像不认这个证书，但是在训练营学到了的前端技术是实打实的。
        </p>
        <p>所以，即使是在专科，也是有一定的学习机会，要好好把握住。</p>
        <h2>技术：</h2>
        <p>
          工作中和日常主要以 <code>React</code>+<code>Typescript</code>
          为主，顺带着写点 <code>Node.js</code> 做 BFF 。
        </p>
      </div>
      <GiscusComment />
    </div>
  );
}
