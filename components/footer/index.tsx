import Image from 'next/image';

import { navItems } from '@/components/navbar/config';
import { NextLink } from '@/components/next-link';

import {
  BEI_AN_LINK,
  BEI_AN_NUMBER,
  GONG_AN_LINK,
  GONG_AN_NUMBER,
  NICKNAME,
  PATHS,
  PATHS_MAP,
} from '@/constants';

export const Footer = () => {
  return (
    <footer className="w-full flex flex-col py-8 max-w-screen-xl mx-auto text-muted-foreground">
      <ul className="flex space-x-2 items-center justify-center">
        {navItems.map((el, idx) => (
          <li key={el.link}>
            {Boolean(idx) && <span className="mr-2">·</span>}
            <NextLink aria-label={el.label} href={el.link} className="px-0">
              {el.label}
            </NextLink>
          </li>
        ))}
        <li>
          <span className="mr-2">·</span>
          <NextLink
            aria-label={PATHS_MAP[PATHS.SITEMAP]}
            href={PATHS.SITEMAP}
            className="px-0"
          >
            {PATHS_MAP[PATHS.SITEMAP]}
          </NextLink>
        </li>
      </ul>
      <div className="w-full text-sm flex items-center justify-center space-x-2 ">
        <span>Copyringht &copy; {new Date().getFullYear()}</span>
        <span>·</span>
        <span>{NICKNAME}</span>
        <span>·</span>
        <NextLink
          target="_blank"
          aria-label={BEI_AN_NUMBER}
          href={BEI_AN_LINK}
          className="px-0"
        >
          {BEI_AN_NUMBER}
        </NextLink>
        <span>·</span>
        <NextLink
          target="_blank"
          aria-label={GONG_AN_NUMBER}
          href={GONG_AN_LINK}
          className="px-0"
        >
          <Image
            width={18}
            height={18}
            src="/images/gongan.png"
            alt={GONG_AN_NUMBER}
            className="mr-1 -translate-y-[1px]"
          />
          <span>{GONG_AN_NUMBER}</span>
        </NextLink>
      </div>
    </footer>
  );
};
