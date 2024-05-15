import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import {
  BEI_AN_LINK,
  BEI_AN_NUMBER,
  GONG_AN_LINK,
  GONG_AN_NUMBER,
  NICKNAME,
  PATHS,
  PATHS_MAP,
  REDIS_PAGE_VIEW,
  REDIS_UNIQUE_VISITOR,
  navItems,
} from '@/constants';
import { redis } from '@/lib/redis';
import { formatNum } from '@/utils';

export const Footer = async () => {
  const pv = await redis.get(REDIS_PAGE_VIEW);
  const uv = await redis.scard(REDIS_UNIQUE_VISITOR);

  return (
    <footer className="max-w-screen-wrapper w-full flex flex-col py-8 text-muted-foreground mx-auto">
      <ul className="flex space-x-2 items-center justify-center text-sm">
        {navItems.map((el, idx) => (
          <li key={el.link}>
            {Boolean(idx) && <span className="mr-2">·</span>}
            <Link
              href={el.link}
              className=" text-muted-foreground hover:text-primary transition-colors"
            >
              {el.label}
            </Link>
          </li>
        ))}
        <li>
          <span className="mr-2">·</span>
          <Link
            aria-label={PATHS_MAP[PATHS.SITEMAP]}
            href={PATHS.SITEMAP}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            {PATHS_MAP[PATHS.SITEMAP]}
          </Link>
        </li>
        <li>
          <span className="mr-2">·</span>
          <span className="text-muted-foreground hover:text-primary transition-colors">
            PV：{formatNum(pv)}
          </span>
        </li>
        <li>
          <span className="mr-2">·</span>
          <span className="hover:text-primary transition-colors">
            UV：{formatNum(uv)}
          </span>
        </li>
      </ul>
      <div className="w-full text-sm flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2 ">
        <span>Copyringht &copy; {new Date().getFullYear()}</span>
        <span className="hidden md:inline-block">·</span>
        <span className="hidden md:inline-block">{NICKNAME}</span>
        <span className="hidden md:inline-block">·</span>
        <Link
          target="_blank"
          aria-label={BEI_AN_NUMBER}
          href={BEI_AN_LINK}
          className="flex items-center h-5 md:h-10 transition-colors text-muted-foreground hover:text-primary"
        >
          {BEI_AN_NUMBER}
        </Link>
        <span className="hidden md:inline-block">·</span>
        <Link
          target="_blank"
          aria-label={GONG_AN_NUMBER}
          href={GONG_AN_LINK}
          className="flex items-center h-5 md:h-10 transition-colors text-muted-foreground hover:text-primary"
        >
          <Image
            width={18}
            height={18}
            src="/images/gongan.png"
            alt={GONG_AN_NUMBER}
            className="mr-1 -translate-y-[1px]"
          />
          <span>{GONG_AN_NUMBER}</span>
        </Link>
      </div>
    </footer>
  );
};
