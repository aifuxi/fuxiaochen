import Link from 'next/link';

import { WEBSITE } from '@/constants/info';

import SocialInfo from '../social-info';

const Footer = () => {
  return (
    <div className="flex flex-col items-center py-12 space-y-1 text-gray-300 text-xs">
      <SocialInfo className="text-2xl" />
      <Link
        href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=36100202000364"
        target="_blank"
        className="flex items-center"
      >
        <img src="/images/beian.png" alt="gongan" className="w-3 h-3 mr-1" />
        赣公网安备 36100202000364号
      </Link>
      <div className="flex space-x-2 items-center ">
        <div>{`© ${new Date().getFullYear()}`}</div>
        <div>{` • `}</div>
        <Link href="/">{WEBSITE}</Link>
        <div>|</div>
        <Link href="https://beian.miit.gov.cn/" target="_blank">
          赣ICP备2023001797号
        </Link>
      </div>
    </div>
  );
};

export default Footer;
