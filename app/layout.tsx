import { Metadata } from 'next';
import { Session } from 'next-auth';

import {
  AnalyticsProvider,
  AuthProvider,
  BackToTop,
  Navbar,
  ToastProvider,
} from '@/components/client';
import { Footer } from '@/components/rsc';
import { WEBSITE } from '@/constants';
import '@/styles/global.scss';
import { cn } from '@/utils';

export const metadata: Metadata = {
  title: {
    template: `%s - ${WEBSITE}`,
    default: `${WEBSITE}`,
  },
};

export default function RootLayout({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
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
        {/* 防止切换主题时闪烁 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
        (function() {
          if (
            localStorage.getItem('color-theme') === 'dark' ||
            (!('color-theme' in localStorage) &&
              window.matchMedia('(prefers-color-scheme: dark)').matches)
          ) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        })();
      `,
          }}
        />
      </head>
      <body
        className={cn(
          'debug-screens antialiased min-w-[360px]',
          'bg-white dark:bg-gray-900',
          'text-black dark:text-white ',
        )}
      >
        <ToastProvider>
          <AuthProvider session={session}>
            <AnalyticsProvider>
              <div className="container">
                <Navbar />
                {children}
                <Footer />
              </div>
              <BackToTop />
            </AnalyticsProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
