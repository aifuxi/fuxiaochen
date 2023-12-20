import { type Metadata } from 'next';
import { type Session } from 'next-auth';

import { Toaster } from '@/components/ui/toaster';

import BackToTop from '@/components/back-to-top';
import { Console } from '@/components/console';
import { AuthProvider, NextThemeProvider } from '@/components/providers';

import { NICKNAME, SLOGAN, WEBSITE } from '@/constants/info';

import '@/styles/global.css';

export const metadata: Metadata = {
  title: {
    template: `%s - ${WEBSITE}`,
    default: `${WEBSITE}`,
  },
  description: `${NICKNAME}, ${SLOGAN}`,
  keywords: NICKNAME,
};

export default function RootLayout({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session;
}) {
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
          content="UT_Si71yQw3RQF1ALRd33CyBjR56msBkQRXe20WP4L0"
        />

        {/* 百度站长验证 */}
        <meta name="baidu-site-verification" content="codeva-3wpRQCVZIT" />
      </head>

      <body className={'debug-screens'}>
        <AuthProvider session={session}>
          <NextThemeProvider attribute="class">
            {children}
            <BackToTop />

            <Toaster />

            <Console />
          </NextThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
