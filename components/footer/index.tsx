import * as React from "react";

import Link from "next/link";

import {
  BEI_AN_LINK,
  BEI_AN_NUMBER,
  GONG_AN_LINK,
  GONG_AN_NUMBER,
  ImageAssets,
  NICKNAME,
  SLOGAN,
} from "@/constants";

export const Footer = () => {
  return (
    <footer className="px-6 py-12">
      <div
        className={`
          flex flex-col items-center justify-center space-y-1 pt-24 text-sm text-muted-foreground
          md:flex-row md:space-y-0 md:space-x-4
        `}
      >
        <Link
          target="_blank"
          aria-label={GONG_AN_NUMBER}
          href={GONG_AN_LINK}
          className={`
            order-2 flex items-center transition-colors
            hover:font-semibold hover:text-primary
            md:order-1
          `}
        >
          <img
            src={ImageAssets.gongan}
            alt={GONG_AN_NUMBER}
            className="mr-1 size-[18px] -translate-y-px"
          />
          <span>{GONG_AN_NUMBER}</span>
        </Link>

        <Link
          target="_blank"
          aria-label={BEI_AN_NUMBER}
          href={BEI_AN_LINK}
          className={`
            order-1 flex items-center transition-colors
            hover:font-semibold hover:text-primary
            md:order-2
          `}
        >
          {BEI_AN_NUMBER}
        </Link>
        <div className="order-3">
          &copy; {new Date().getFullYear()} {NICKNAME}&nbsp;&nbsp;·&nbsp;&nbsp;
          {SLOGAN}
        </div>
      </div>
    </footer>
  );
};
