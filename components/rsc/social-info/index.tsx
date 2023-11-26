import Link from 'next/link';

import { BILIBILI_PAGE, GITHUB_PAGE, JUEJIN_PAGE } from '@/constants';
import { cn } from '@/utils';

import { IconBilibili, IconGithub, IconJuejin } from '../icons';

type Props = {
  className?: string;
};

export function SocialInfo({ className }: Props) {
  return (
    <div
      className={cn(
        'flex justify-center space-x-2 text-4xl text-gray-300',
        className,
      )}
    >
      <Link
        target="_blank"
        href={GITHUB_PAGE}
        className={cn(
          'transition-all',
          'hover:scale-110 hover:text-gray-800  dark:hover:text-white',
        )}
      >
        <IconGithub />
      </Link>
      <Link
        target="_blank"
        href={JUEJIN_PAGE}
        className="transition-all hover:scale-110 hover:text-[#1e80ff]"
      >
        <IconJuejin />
      </Link>
      <Link
        target="_blank"
        href={BILIBILI_PAGE}
        className="transition-all hover:scale-110 hover:text-[#00aeec]"
      >
        <IconBilibili />
      </Link>
    </div>
  );
}
