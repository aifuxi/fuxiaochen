import * as React from "react";

import { TooltipProvider } from "@/components/ui/tooltip";

import { NextThemesProvider } from "@/components/providers";
import { ToasterComponent } from "@/components/toast";

import "@/styles/global.css";

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
      </head>
      <body className="debug-screens overflow-x-clip scroll-smooth">
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            <ToasterComponent />
          </TooltipProvider>
        </NextThemesProvider>
      </body>
    </html>
  );
}
