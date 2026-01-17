import type { Metadata } from "next";
import Script from "next/script";

import { GoogleAnalytics } from "@next/third-parties/google";

import { BackToTop } from "@/components/cyberpunk/back-to-top";
import { NeonFooter } from "@/components/cyberpunk/neon-footer";
import { NeonHeader } from "@/components/cyberpunk/neon-header";

import { NICKNAME, SLOGAN, WEBSITE } from "@/constants/info";
import { isProduction } from "@/lib/env";
import "@/styles/global.css";

export const metadata: Metadata = {
  title: {
    template: `%s | ${WEBSITE}`,
    default: WEBSITE,
  },
  description: SLOGAN,
  keywords: NICKNAME,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark scroll-smooth">
      <body
        className={`
          bg-cyber-black text-white antialiased
          selection:bg-neon-cyan selection:text-black
          ${isProduction() ? "" : "debug-screens"}
        `}
      >
        <div
          className={`
            pointer-events-none fixed inset-0 mask-[linear-gradient(180deg,white,rgba(255,255,255,0))] bg-center
            opacity-20
          `}
        />
        <div className="pointer-events-none fixed inset-0 bg-cyber-black/50" />

        <NeonHeader />
        {children}

        <NeonFooter />
        <BackToTop />

        {/* CRT Scanline Effect */}
        <div
          className={`
            pointer-events-none fixed inset-0 z-50
            bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))]
            bg-[length:100%_2px,3px_100%]
            opacity-[0.03]
          `}
        />
      </body>

      {/* Google Analytics  */}
      {isProduction() && <GoogleAnalytics gaId="G-1MVP2JY3JG" />}

      {/* umami 统计 */}
      {isProduction() && (
        <Script
          id="umami"
          src={process.env.NEXT_PUBLIC_UMAMI_URL}
          async
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
        />
      )}
    </html>
  );
}
