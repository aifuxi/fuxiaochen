import type { Metadata } from "next";

import { BackToTop } from "@/components/cyberpunk/back-to-top";
import { NeonHeader } from "@/components/cyberpunk/neon-header";

import "@/styles/global.css";

export const metadata: Metadata = {
  title: "付小晨 | 赛博空间 / FuXiaochen | Cyberpunk Space",
  description:
    "付小晨的个人数字终端，展示项目、博客与技术思考。 / A futuristic digital terminal showcasing projects and transmissions by FuXiaochen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark scroll-smooth">
      <body
        className={`antialiased bg-cyber-black text-white selection:bg-neon-cyan selection:text-black`}
      >
        <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-20" />
        <div className="fixed inset-0 bg-cyber-black/50 pointer-events-none" />

        <NeonHeader />
        {children}
        <BackToTop />

        {/* CRT Scanline Effect */}
        <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-[0.03]" />
      </body>
    </html>
  );
}
