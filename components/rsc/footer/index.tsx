import Link from 'next/link';

import { WEBSITE } from '@/constants/info';

import SocialInfo from '../social-info';

export default function Footer() {
  return (
    <div className="flex flex-col items-center space-y-1 justify-center text-xs text-gray-300 h-[136px]">
      <SocialInfo className="text-2xl xl:hidden" />
      <Link
        href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=36100202000364"
        target="_blank"
        rel="nofollow"
        className="flex items-center"
      >
        <img src="/images/beian.png" alt="gongan" className="mr-1 h-3 w-3" />
        赣公网安备 36100202000364号
      </Link>
      <div className="flex items-center space-x-2 ">
        <div>{`© ${new Date().getFullYear()} • ${WEBSITE}`}</div>
        <div>|</div>
        <Link href="https://beian.miit.gov.cn/" target="_blank" rel="nofollow">
          赣ICP备2023001797号
        </Link>
      </div>
    </div>
  );
}