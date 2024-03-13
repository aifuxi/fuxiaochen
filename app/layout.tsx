import { type Metadata } from 'next';

import { NICKNAME, SLOGAN, WEBSITE } from '@/config';

import { type FCProps } from '@/types';

import { NextThemeProvider, ReactQueryProvider } from '@/providers';

import { Toaster } from '@/components/ui/toast';
import { TooltipProvider } from '@/components/ui/tooltip';

import BackToTop from '@/components/back-to-top';
import { Favicon } from '@/components/favicon';

import '@/styles/global.css';

export const metadata: Metadata = {
  title: {
    template: `%s - ${WEBSITE}`,
    default: `${WEBSITE}`,
  },
  description: `${SLOGAN}`,
  keywords: NICKNAME,
};

export default function RootLayout({ children }: FCProps) {
  return (
    <html suppressHydrationWarning lang="zh-CN">
      <head>
        <link
          rel="icon"
          type="image/svg+xml"
          href="/images/fuxiaochen-dark.svg"
        />
      </head>
      <body className="debug-screens">
        <ReactQueryProvider>
          <TooltipProvider>
            <NextThemeProvider attribute="class">
              {children}

              {typeof window !== 'undefined' && <BackToTop />}

              <Toaster />

              <Favicon />
            </NextThemeProvider>
          </TooltipProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
