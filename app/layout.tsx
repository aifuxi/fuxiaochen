import "./globals.css";
import type { Metadata } from "next";

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
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
