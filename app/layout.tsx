import { type Metadata } from 'next';
import { type Session } from 'next-auth';

import { AuthProvider } from '@/components/client';
import { ThemeProvider } from '@/components/client/providers';
import { WEBSITE } from '@/constants';
import '@/styles/global.css';

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
        {/* 打开外部链接时，以新开tab的方式打开 */}
        <base target="_blank" />
      </head>

      <body className={'debug-screens'}>
        <AuthProvider session={session}>
          <ThemeProvider
            accentColor="sky"
            panelBackground="solid"
            radius="none"
            className="h-full"
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
