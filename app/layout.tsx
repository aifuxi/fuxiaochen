import React from "react";

import { type Metadata } from "next";

import { GoogleAnalytics } from "@next/third-parties/google";

import { NODE_ENV } from "@/config";

import { ThemeProvider } from "@/providers";

import { ReactHotToaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Console } from "@/components/console";
import { Favicon } from "@/components/favicon";

import { NICKNAME, SLOGAN, WEBSITE } from "@/constants";
import "@/styles/global.css";

export const metadata: Metadata = {
  title: {
    template: `%s - ${WEBSITE}`,
    default: `${WEBSITE}`,
  },
  description: `${SLOGAN}`,
  keywords: NICKNAME,
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html suppressHydrationWarning lang="zh-CN">
      <head>
        <link
          rel="icon"
          type="image/svg+xml"
          href="/images/fuxiaochen-dark.svg"
        />
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
          <TooltipProvider>
            {children}

            <Favicon />
            <ReactHotToaster />

            <Console />
          </TooltipProvider>
        </ThemeProvider>
      </body>

      {/* Google Analytics  */}
      {NODE_ENV === "production" && <GoogleAnalytics gaId="G-1MVP2JY3JG" />}
    </html>
  );
}
