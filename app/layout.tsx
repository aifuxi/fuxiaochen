import "./globals.css";
import type { Metadata } from "next";

import { NavigationGuardProvider } from "@/components/admin/navigation-guard";
import { MotionProvider } from "@/components/motion/motion-provider";
import { PageMotionController } from "@/components/motion/page-motion-controller";

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
    <html lang="zh-CN" data-scroll-behavior="smooth" className="font-sans">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased">
        <MotionProvider>
          <PageMotionController />
          <NavigationGuardProvider>{children}</NavigationGuardProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
