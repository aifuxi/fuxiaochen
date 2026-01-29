import type { Metadata } from "next";
import Script from "next/script";

import { GoogleAnalytics } from "@next/third-parties/google";
import { Toaster } from "sonner";

import { NICKNAME, SLOGAN, WEBSITE } from "@/constants/info";
import { isProduction } from "@/lib/env";
import "@/styles/global.css";

export const metadata: Metadata = {
  title: {
    template: `%s | ${WEBSITE}`,
    default: WEBSITE,
  },
  description: SLOGAN,
  keywords: NICKNAME,
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  minimumScale: 1.0,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark scroll-smooth">
      <body
        className={`
          bg-cyber-black text-white antialiased
          selection:bg-neon-cyan selection:text-black
          ${isProduction() ? "" : "debug-screens"}
        `}
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>

      {/* Google Analytics  */}
      {isProduction() && <GoogleAnalytics gaId="G-1MVP2JY3JG" />}

      {/* umami 统计 */}
      {isProduction() && (
        <Script
          id="umami"
          src={process.env.NEXT_PUBLIC_UMAMI_URL}
          async
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
        />
      )}
    </html>
  );
}
