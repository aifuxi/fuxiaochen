import { type Metadata } from 'next';
import { type Session } from 'next-auth';

import {
  AuthProvider,
  BackToTop,
  NavbarV1,
  ToggleTheme,
} from '@/components/client';
import { ThemeProvider } from '@/components/client/providers';
import { Footer } from '@/components/rsc';
import { WEBSITE } from '@/constants';
import '@/styles/global.scss';
import { cn } from '@/utils';

import '@radix-ui/themes/styles.css';

export const metadata: Metadata = {
  title: `${WEBSITE}`,
};

export default function RootLayout({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session;
}) {
  return (
    <html suppressHydrationWarning>
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
            localStorage.getItem('color-theme') === 'dark' ??
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
        {/* 打开外部链接时，以新开tab的方式打开 */}
        <base target="_blank" />
      </head>
      <body className={cn('debug-screens min-w-[360px]')}>
        <AuthProvider session={session}>
          <ThemeProvider
            accentColor="sky"
            panelBackground="solid"
            radius="none"
          >
            {/* 侧边导航栏 */}
            <NavbarV1 />
            {children}

            {/* 底部 footer */}
            <Footer />
          </ThemeProvider>
        </AuthProvider>

        {/* 切换主题按钮 */}
        <ToggleTheme className="fixed top-16 right-12" />

        {/* 返回顶部按钮 */}
        <BackToTop />
      </body>
    </html>
  );
}
