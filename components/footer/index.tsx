import Link from 'next/link';

import { Separator } from '@/components/ui/separator';
import { WEBSITE } from '@/constants/info';

import { SocialInfo } from '../social-info';

export function Footer() {
  return (
    <div className="flex flex-col items-center gap-1 py-8">
      <SocialInfo />
      <Link
        href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=36100202000364"
        target="_blank"
        rel="nofollow"
      >
        <div className="flex items-center gap-2">
          <img src="/images/beian.png" alt="gongan" className="w-4 h-4" />
          <div className="text-sm text-muted-foreground">
            赣公网安备 36100202000364号
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{`© ${new Date().getFullYear()} • ${WEBSITE}`}</span>
        <Separator orientation="vertical" />
        <Link
          href="https://beian.miit.gov.cn/"
          target="_blank"
          className="flex items-center"
          rel="nofollow"
        >
          <span className="text-sm text-muted-foreground">
            赣ICP备2023001797号
          </span>
        </Link>
      </div>
    </div>
  );
}
