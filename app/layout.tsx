import * as React from "react";

import { type Metadata } from "next";
import Script from "next/script";

import { GoogleAnalytics } from "@next/third-parties/google";

import { NEXT_PUBLIC_UMAMI_URL, NEXT_PUBLIC_UMAMI_WEBSITE_ID } from "@/config";

import { ThemeProvider } from "@/providers";

import { TooltipProvider } from "@/components/ui/tooltip";

import { BProgressProvider } from "@/components/b-progress-provider";
import { Console } from "@/components/console";
import { ToasterComponent } from "@/components/toast";

import { NICKNAME, SLOGAN, WEBSITE } from "@/constants";
import "@/styles/global.css";
import { isProduction } from "@/utils";

export const metadata: Metadata = {
  title: {
    template: `%s - ${WEBSITE}`,
    default: WEBSITE,
  },
  description: SLOGAN,
  keywords: NICKNAME,
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html suppressHydrationWarning lang="zh-CN">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        {/* Google Search Console 验证 */}
        <meta
          name="google-site-verification"
          content="DTiRVawomypV2iRoz9UUw2P0wAxnPs-kffJl6MNevdM"
        />
      </head>
      <body className="debug-screens overflow-x-clip scroll-smooth">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <BProgressProvider>
            <TooltipProvider>
              {children}

              <Console />

              <ToasterComponent />
            </TooltipProvider>
          </BProgressProvider>
        </ThemeProvider>
      </body>

      {/* Google Analytics  */}
      {isProduction() && <GoogleAnalytics gaId="G-1MVP2JY3JG" />}

      {/* umami 统计 */}
      <Script
        id="umami"
        src={NEXT_PUBLIC_UMAMI_URL}
        async
        data-website-id={NEXT_PUBLIC_UMAMI_WEBSITE_ID}
      />
    </html>
  );
}
