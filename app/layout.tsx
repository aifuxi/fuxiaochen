import { type Metadata } from 'next';

import { type FCProps } from '@/types';

import { Toaster } from '@/components/ui/toaster';

import BackToTop from '@/components/back-to-top';
import { Console } from '@/components/console';
import { NextThemeProvider } from '@/components/providers';

import { NICKNAME, SLOGAN, WEBSITE } from '@/config';
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

      <body className={'debug-screens'}>
        <NextThemeProvider attribute="class">
          {children}
          <BackToTop />

          <Toaster />

          <Console />
        </NextThemeProvider>
      </body>
    </html>
  );
}
