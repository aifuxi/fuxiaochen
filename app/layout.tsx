import type { Metadata } from "next";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
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
    <html lang="zh-CN" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        {/* Google Search Console 验证 */}
        {isProduction() &&
          process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_CONTENT && (
            <meta
              name="google-site-verification"
              content={process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_CONTENT}
            />
          )}
      </head>
      <body
        className={`
          bg-[var(--bg-color)] text-[var(--text-color)] antialiased
          selection:bg-[var(--accent-color)] selection:text-white
          ${isProduction() ? "" : "debug-screens"}
        `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
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
