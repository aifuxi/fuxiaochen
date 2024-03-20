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
      <div className="w-full text-sm flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2 ">
        <span>Copyringht &copy; {new Date().getFullYear()}</span>
        <span className="hidden md:inline-block">·</span>
        <span className="hidden md:inline-block">{NICKNAME}</span>
        <span className="hidden md:inline-block">·</span>
        <NextLink
          target="_blank"
          aria-label={BEI_AN_NUMBER}
          href={BEI_AN_LINK}
          className="px-0 py-0 h-5 md:h-10 font-normal md:font-medium"
        >
          {BEI_AN_NUMBER}
        </NextLink>
        <span className="hidden md:inline-block">·</span>
        <NextLink
          target="_blank"
          aria-label={GONG_AN_NUMBER}
          href={GONG_AN_LINK}
          className="px-0 py-0 h-5 md:h-10 font-normal md:font-medium"
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
