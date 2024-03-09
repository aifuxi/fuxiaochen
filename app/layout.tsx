import { type Metadata } from 'next';

import { NICKNAME, SLOGAN, WEBSITE } from '@/config';

import { type FCProps } from '@/types';

import { NextThemeProvider, ReactQueryProvider } from '@/providers';

import { Toaster } from '@/components/ui/toast';

import BackToTop from '@/components/back-to-top';
import { Console } from '@/components/console';
import { Favicon } from '@/components/favicon';

import '@/styles/global.css';

export const metadata: Metadata = {
  title: {
    template: `%s · ${WEBSITE}`,
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
      <body className={'debug-screen'}>
        <ReactQueryProvider>
          <NextThemeProvider attribute="class">
            {children}
            <BackToTop />

            <Toaster />

            <Console />

            <Favicon />
          </NextThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
