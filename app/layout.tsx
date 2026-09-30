import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fuxiaochen Afterglow · Design spec",
  description: "暗色材质、组件状态与流畅微交互的设计系统规范。",
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
