import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import Script from "next/script";

import { GoogleAnalytics } from "@next/third-parties/google";

import "@/styles/global.css";
import { ModalProvider } from "@/components/modal-provider";
import { ThemeProvider } from "@/components/theme-provider";

import { isProduction } from "@/lib/env";

import { siteCopy } from "@/constants/site-copy";

import "./globals.css";

const _spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});
const _spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: siteCopy.metadata.root.title,
  description: siteCopy.metadata.root.description,
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${_spaceGrotesk.variable} ${_spaceMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        {/* Google Search Console 验证 */}
        {isProduction() &&
          process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_CONTENT && (
            <meta
              name="google-site-verification"
              content={process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_CONTENT}
            />
          )}
      </head>
      <body className="font-sans antialiased">
        <ModalProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </ModalProvider>
      </body>

      {/* Google Analytics  */}
      {isProduction() && process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
      )}

      {/* umami 统计 */}
      {isProduction() &&
        process.env.NEXT_PUBLIC_UMAMI_URL &&
        process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
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
