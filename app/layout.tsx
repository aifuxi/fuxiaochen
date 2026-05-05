import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import { ApiErrorToastListener } from "@/components/api-error-toast-listener";
import { ModalProvider } from "@/components/modal-provider";
import { ThemeProvider } from "@/components/theme-provider";

import { getCachedSiteSettings } from "@/lib/server/settings/service";
import { buildFullTitle } from "@/lib/settings/title";

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
  const { settings } = await getCachedSiteSettings();

  return {
    title: buildFullTitle(settings),
    description: settings.seo.defaultDescription,
    icons: {
      icon: settings.general.logoUrl,
    },
  };
}

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
    </html>
  );
}
