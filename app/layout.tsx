import { Metadata } from 'next';

import { Footer, Navbar, ToastProvider } from '@/components';
import { WEBSITE } from '@/constants';
import '@/styles/global.scss';

export const metadata: Metadata = {
  title: {
    template: `%s - ${WEBSITE}`,
    default: `${WEBSITE}`, // a default is required when creating a template
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
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
      <body className="debug-screens antialiased min-w-[360px]">
        <div className="container">
          <ToastProvider>
            <Navbar />
            {children}
            <Footer />
          </ToastProvider>
        </div>
      </body>
    </html>
  );
}
