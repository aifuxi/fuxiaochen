import "./globals.css";
import type { Metadata } from "next";

import localFont from "next/font/local";

const inter = localFont({
  src: "./fonts/InterVariable.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-inter",
  adjustFontFallback: false,
});

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
    <html lang="zh-CN" className={`${inter.variable} font-sans`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
