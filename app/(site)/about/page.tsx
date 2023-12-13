import { type Metadata } from 'next';

import { PageTitle } from '@/components/page-title';

import { cn } from '@/utils/helper';

import { NICKNAME } from '@/constants/info';

export const metadata: Metadata = {
  title: '关于',
};

export const revalidate = 60;

export default function AboutPage() {
  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-8 pb-9">
        <PageTitle title="关于" />

        <div className="flex flex-col gap-2 items-center">
          <img
            src="https://aifuxi.oss-cn-shanghai.aliyuncs.com/self/avatar.jpeg"
            className="w-[180px] h-[180px]"
            alt={NICKNAME}
          />
          <h3 className="text-2xl font-bold leading-8">{NICKNAME}</h3>
          <div>前端工程师</div>
          <blockquote className={cn('italic indent-8')}>
            学习的时候要带着自己的思考，不要盲目崇拜，也不要全部照搬前人的经验和成果。只有经过自己思考，学以致用，方能在属于自己的蛊仙(程序员)之路上走的更远！
          </blockquote>
          <div className={cn('w-full text-right italic text-xs')}>
            Forked from 大爱仙尊 - 古月方源
          </div>
        </div>

        <div className="prose max-w-none dark:prose-invert">
          <h2>简介：</h2>
          <p>
            我是F西，目前工作是前端开发，但是对后端也很感兴趣，两者都持续学习中，目标是让自己具备全栈开发的能力。在我看来，不懂后端的前端不是好前端。
          </p>
          <p />
          <h2>坐标：</h2>
          <p>上海</p>
        </div>
      </div>
    </div>
  );
}
