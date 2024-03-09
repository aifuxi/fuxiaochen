import { WEBSITE } from '@/config';

import { NextLink } from '../next-link';

export function Footer() {
  return (
    <div className="flex flex-col items-center gap-1 py-8 text-sm text-foreground/60 ">
      <NextLink
        href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=36100202000364"
        target="_blank"
        rel="nofollow"
      >
        <div className="flex items-center gap-2">
          <img src="/images/beian.png" alt="gongan" className="w-4 h-4" />
          <div>赣公网安备 36100202000364号</div>
        </div>
      </NextLink>

      <div className="flex items-center text-muted-foreground">
        <span>{`© ${new Date().getFullYear()} · ${WEBSITE}`}</span>
        <NextLink
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="nofollow"
        >
          赣ICP备2023001797号
        </NextLink>
      </div>
    </div>
  );
}
