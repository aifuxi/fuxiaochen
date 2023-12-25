import Link from 'next/link';

import { cn } from '@/utils/helper';

import { EMAIL, NICKNAME } from '@/constants/info';
import { PATHS } from '@/constants/path';

export function AboutMe() {
  return (
    <div className="py-20 flex flex-col items-center relative min-h-[600px]">
      <h2 className="mt-10 scroll-m-20 flex flex-col sm:flex-row text-3xl font-semibold tracking-widest transition-colors first:mt-0">
        <span>关于我</span>
        <span className="hidden sm:inline-flex">/</span>
        <span>About me</span>
      </h2>
      <div className="absolute top-40 -skew-y-[3deg] inset-x-0  -z-[1] min-h-[700px]  md:min-h-[400px] pointer-events-none bg-foreground"></div>
      <div className="w-full flex flex-col md:flex-row justify-between items-center pt-28 text-sm sm:text-base">
        <img
          src="/images/aifuxi.webp"
          className="w-[220px] h-[220px] rounded-full border-4 mb-4"
          alt={NICKNAME}
        />

        <div className="text-primary-foreground font-medium px-4 sm:px-16 flex flex-col gap-3">
          <p>
            Hi，我是{NICKNAME}
            ，一名前端开发工程师，但是对后端也很感兴趣，两者都持续学习中，目标是让自己具备全栈开发的能力。
          </p>
          <div>
            <blockquote className={cn('italic indent-8')}>
              学习的时候要带着自己的思考，不要盲目崇拜，也不要全部照搬前人的经验和成果。只有经过自己思考，学以致用，方能在属于自己的蛊仙(程序员)之路上走的更远！
            </blockquote>
            <div className={cn('w-full text-right italic text-xs')}>
              Forked from 大爱仙尊 - 古月方源
            </div>
          </div>
          <p>闲暇之余喜欢写代码、玩游戏和骑车。</p>
          <p>
            如果你对我感兴趣，可以在本站
            <Link
              href={PATHS.SITE_MESSAGE_BOARD}
              className="font-semibold mx-1"
            >
              留言
            </Link>
            或者通过 {EMAIL} 发邮件联系我。
          </p>
        </div>
      </div>
    </div>
  );
}
