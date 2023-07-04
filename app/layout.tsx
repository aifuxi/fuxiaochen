import { Navbar } from '@/components';

import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="debug-screens">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 xl:max-w-5xl xl:px-0 h-screen">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
