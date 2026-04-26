import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import Script from "next/script";

import { GoogleAnalytics } from "@next/third-parties/google";

import { Toaster } from "@/components/ui/sonner";

import { ApiErrorToastListener } from "@/components/api-error-toast-listener";
import { ModalProvider } from "@/components/modal-provider";
import { ThemeProvider } from "@/components/theme-provider";

import { isProduction } from "@/lib/env";
import { settingsService } from "@/lib/server/settings/service";

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

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await settingsService.getSettings();

  return {
    title: settings.seo.defaultTitle,
    description: settings.seo.defaultDescription,
    metadataBase: new URL(settings.general.siteUrl),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { settings } = await settingsService.getSettings();
  const { googleAnalytics, googleSearchConsole, umami } = settings.analytics;

  return (
    <html
      lang="zh-CN"
      className={`${_spaceGrotesk.variable} ${_spaceMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href={settings.general.logoUrl} />
        {/* Google Search Console 验证 */}
        {isProduction() &&
          googleSearchConsole.enabled &&
          googleSearchConsole.verificationContent && (
            <meta
              name="google-site-verification"
              content={googleSearchConsole.verificationContent}
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
            <Toaster />
            <ApiErrorToastListener />
          </ThemeProvider>
        </ModalProvider>
      </body>

      {/* Google Analytics  */}
      {isProduction() &&
        googleAnalytics.enabled &&
        googleAnalytics.measurementId && (
          <GoogleAnalytics gaId={googleAnalytics.measurementId} />
        )}

      {/* umami 统计 */}
      {isProduction() &&
        umami.enabled &&
        umami.scriptUrl &&
        umami.websiteId && (
          <Script
            id="umami"
            src={umami.scriptUrl}
            async
            data-website-id={umami.websiteId}
          />
        )}
    </html>
  );
}
