import * as React from "react";

import { type Metadata } from "next";
import Script from "next/script";

import { GoogleAnalytics } from "@next/third-parties/google";

import { TooltipProvider } from "@/components/ui/tooltip";

import { BProgressProvider, ThemeProvider } from "@/components/providers";

import { NICKNAME, SLOGAN, WEBSITE } from "@/constants";
import "@/styles/global.css";
import { isProduction } from "@/utils";

export const metadata: Metadata = {
  title: {
    template: `%s | ${WEBSITE}`,
    default: WEBSITE,
  },
  description: SLOGAN,
  keywords: NICKNAME,
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html suppressHydrationWarning lang="zh-CN">
      <head>
        <link rel="icon" type="image/svg+xml" href="/images/fuxiaochen-logo.svg" />
        {/* Google Search Console 验证 */}
        <meta
          name="google-site-verification"
          content={process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_CONTENT}
        />
      </head>
      <body className="debug-screens scroll-smooth font-sans antialiased">
        <ThemeProvider attribute="class" enableColorScheme enableSystem>
          <BProgressProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </BProgressProvider>
        </ThemeProvider>
      </body>

      {/* Google Analytics  */}
      {isProduction() && process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
      )}

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
