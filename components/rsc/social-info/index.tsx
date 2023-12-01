import Link from 'next/link';

import { Flex } from '@radix-ui/themes';

import { BILIBILI_PAGE, GITHUB_PAGE, JUEJIN_PAGE } from '@/constants';

import { IconBilibili, IconGithub, IconJuejin } from '../../icons';

export function SocialInfo() {
  return (
    <Flex gap={'2'}>
      <Link
        target="_blank"
        href={GITHUB_PAGE}
        className={
          'transition-all text-gray-11 hover:text-gray-12 text-3 hover:scale-110'
        }
      >
        <IconGithub />
      </Link>
      <Link
        target="_blank"
        href={JUEJIN_PAGE}
        className="transition-all text-3 text-gray-11 hover:scale-110 hover:text-[#1e80ff]"
      >
        <IconJuejin />
      </Link>
      <Link
        target="_blank"
        href={BILIBILI_PAGE}
        className="transition-all text-3 text-gray-11 hover:scale-110 hover:text-[#00aeec]"
      >
        <IconBilibili />
      </Link>
    </Flex>
  );
}
