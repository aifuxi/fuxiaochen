import "bytemd/dist/index.css";
import "./globals.css";

import type { Metadata } from "next";

import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Chen Serif",
  description: "A Chen Serif blog and CMS system built with Tailwind CSS v4 and Base UI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={cn("min-h-full bg-background")}>
      <body className="min-h-screen bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
