import { Metadata } from 'next';
import Image from 'next/image';

import { SocialInfo } from '@/components';
import { NICKNAME } from '@/constants';

export const metadata: Metadata = {
  title: '关于',
};

const AboutPage = () => {
  return (
    <div className="flex flex-col space-y-8">
      <h1
        className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900
        sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 border-b py-8"
      >
        关于
      </h1>

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
        <div className="text-gray-500 dark:text-gray-400">前端开发工程师</div>
        <blockquote className="text-gray-500 dark:text-gray-400 italic indent-8">
          学习的时候要带着自己的思考，不要盲目崇拜，也不要全部照搬前人的经验和成果。只有经过自己思考，学以致用，放能在属于自己的蛊仙(程序员)之路上走的更远！
        </blockquote>
        <div className="w-full text-right text-gray-500 dark:text-gray-400 italic text-xs">
          forked from 大爱仙尊-古月方源
        </div>
      </div>

      <SocialInfo />

      <div className="prose dark:prose-dark">
        <ul>
          <li>姓名：xxx</li>
          <li>昵称：xxx</li>
          <li>座右铭：你不一定要很厲害，才能開始；但你要開始，才能很厲害</li>
          <li>我是一名前端工程师，xxxxxxxxxxxxxxxxxxxxxxxxx</li>
          <li>坐标：上海</li>
          <li>
            skill：
            <ul>
              <li>前端：React、ES6/7/8、Antd、Axios、Tailwindcss</li>
              <li>服务端：Next.js、Koa2、Prisma、Typeorm</li>
              <li>数据库：Mysql、Postgresql</li>
              <li>其他：Webpack、Vite、Typescript、Serverless</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AboutPage;
