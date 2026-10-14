import "./globals.css";
import type { Metadata } from "next";

import { NavigationGuardProvider } from "@/components/admin/navigation-guard";
import { MotionProvider } from "@/components/motion/motion-provider";
import { PageMotionController } from "@/components/motion/page-motion-controller";
import { themeInitializationScript } from "@/components/theme/theme-contract";
import { ThemeProvider } from "@/components/theme/theme-provider";

export const metadata: Metadata = {
  title: "付小晨",
  description: "付小晨 个人站点。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      data-scroll-behavior="smooth"
      data-theme="dark"
      className="font-sans"
      suppressHydrationWarning
    >
      <head>
        {/* 在绘制内容前应用主题；脚本为固定常量，不包含用户输入。 */}
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <MotionProvider>
            <PageMotionController />
            <NavigationGuardProvider>{children}</NavigationGuardProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
