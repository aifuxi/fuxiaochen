import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { ApiErrorToastListener } from "@/components/api-error-toast-listener";
import { ModalProvider } from "@/components/modal-provider";
import { ThemeProvider } from "@/components/theme-provider";

import { getCachedSiteSettings } from "@/lib/server/settings/service";

import "./globals.css";
import { buildFullTitle } from "@/lib/settings/title";

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
    <html lang="zh-CN" className="font-sans" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ModalProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster />
            <ApiErrorToastListener />
          </ThemeProvider>
        </ModalProvider>
      </body>
    </html>
  );
}
