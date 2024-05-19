import React from 'react';

import Link from 'next/link';

import {
  BEI_AN_LINK,
  BEI_AN_NUMBER,
  GONG_AN_LINK,
  GONG_AN_NUMBER,
  ImageAssets,
  NICKNAME,
  PATHS,
  PATHS_MAP,
  navItems,
} from '@/constants';
import { getSiteStatistics } from '@/features/statistics';
import { cn } from '@/lib/utils';
import { formatNum } from '@/utils';

import { Logo } from '../logo';
import { Wrapper } from '../wrapper';

export const Footer = async () => {
  const { pv, uv, todayPV, todayUV } = await getSiteStatistics();

  return (
    <footer className="py-24">
      <Wrapper
        className={cn(
          'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[auto,1fr,1fr,1fr] gap-x-24 gap-y-8 text-sm text-muted-foreground',
        )}
      >
        <dl className="flex flex-col gap-3">
          <dt className="flex space-x-2 items-center font-bold text-primary text-lg">
            <Logo />
            <span className="ml-2">{NICKNAME}</span>
          </dt>
          <dd>
            &copy; {new Date().getFullYear()} {NICKNAME}
          </dd>
          <dd>
            <Link
              target="_blank"
              aria-label={BEI_AN_NUMBER}
              href={BEI_AN_LINK}
              className="flex items-center transition-colors hover:text-primary hover:font-semibold"
            >
              {BEI_AN_NUMBER}
            </Link>
          </dd>
          <dd>
            <Link
              target="_blank"
              aria-label={GONG_AN_NUMBER}
              href={GONG_AN_LINK}
              className="flex items-center transition-colors hover:text-primary hover:font-semibold"
            >
              <img
                src={ImageAssets.gongan}
                alt={GONG_AN_NUMBER}
                className="mr-1 -translate-y-[1px] w-[18px] h-[18px]"
              />
              <span>{GONG_AN_NUMBER}</span>
            </Link>
          </dd>
        </dl>
        <dl className="flex flex-col gap-3">
          <dt className="text-primary font-semibold text-lg">导航</dt>
          {navItems.map((el) => (
            <dd key={el.link}>
              <Link
                href={el.link}
                className="flex items-center transition-colors hover:font-semibold hover:text-primary"
              >
                {el.label}
              </Link>
            </dd>
          ))}
          <dd>
            <Link
              href={PATHS.SITEMAP}
              className="hover:text-primary transition-colors hover:font-semibold"
            >
              {PATHS_MAP[PATHS.SITEMAP]}
            </Link>
          </dd>
        </dl>
        <dl className="flex flex-col gap-3">
          <dt className="text-primary font-semibold text-lg">统计</dt>
          <dd>
            今日 <span>{formatNum(todayPV)}</span> 次浏览
          </dd>
          <dd>
            今日 <span>{formatNum(todayUV)}</span> 人访问
          </dd>

          <dd>
            总 <span>{formatNum(pv)}</span> 次浏览（PV）
          </dd>
          <dd>
            总 <span>{formatNum(uv)}</span> 人访问（UV）
          </dd>
        </dl>
      </Wrapper>
    </footer>
  );
};
