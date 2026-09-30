import "./globals.css";
import type { Metadata } from "next";

import { CursorEffect } from "@/components/ui/cursor-effect";

export const metadata: Metadata = {
  title: "fuxiaochen",
  description: "fuxiaochen 个人站点。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="font-sans" suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
        <CursorEffect />
      </body>
    </html>
  );
}
