import { Metadata } from "next";

import { BackToTop } from "@/components/cyberpunk/back-to-top";
import { NeonHeader } from "@/components/cyberpunk/neon-header";

import "@/styles/global.css";

export const metadata: Metadata = {
  title: "Cyberpunk Portal",
  description: "A futuristic cyberpunk portfolio and blog",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-neon-cyan selection:text-cyber-black">
        <div className="scanlines" />
        <NeonHeader />
        <main className="relative min-h-screen">{children}</main>
        <BackToTop />
      </body>
    </html>
  );
}
