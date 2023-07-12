import { Metadata } from 'next';
import { Session } from 'next-auth';

import {
  AnalyticsProvider,
  AuthProvider,
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
    default: `${WEBSITE}`, // a default is required when creating a template
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
    <html lang="zh-CN">
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
      <body
        className={cn(
          'debug-screens antialiased min-w-[360px] transition-all',
          'bg-white dark:bg-gray-900',
          'text-black dark:text-white',
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
            </AnalyticsProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
