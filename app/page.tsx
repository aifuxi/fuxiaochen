import { type Metadata } from 'next';

import { NICKNAME } from '@/constants';
import { cn } from '@/utils';

export const revalidate = 60;

export const metadata: Metadata = {
  description: `${NICKNAME}，一个正在努力的程序员。`,
  keywords: 'F西、aifuxi',
};

export default function HomePage() {
  return (
    <div className="container">
      <div className="flex flex-col h-[calc(100vh-136px)] justify-center items-center">
        <img
          src="/images/nyan-cat.webp"
          alt="Nyan Cat"
          className={cn('w-full h-auto')}
        />
        <div className="flex">
          <h2
            className={cn(
              'flex font-semibold',
              'text-xl sm:text-4xl 2xl:text-5xl',
            )}
          >
            F西，努力做一个更好的程序员。
          </h2>
        </div>
      </div>
    </div>
  );
}
