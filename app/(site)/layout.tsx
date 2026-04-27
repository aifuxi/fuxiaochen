import type { Metadata } from "next";
import Script from "next/script";

import { GoogleAnalytics } from "@next/third-parties/google";

import { SiteLayout } from "@/components/site/site-layout";

import { isProduction } from "@/lib/env";
import { getCachedSiteSettings } from "@/lib/server/settings/service";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getCachedSiteSettings();
  const { googleSearchConsole } = settings.analytics;

  return {
    title: settings.seo.defaultTitle,
    description: settings.seo.defaultDescription,
    metadataBase: new URL(settings.general.siteUrl),
    icons: {
      icon: settings.general.logoUrl,
    },
    verification:
      isProduction() &&
      googleSearchConsole.enabled &&
      googleSearchConsole.verificationContent
        ? {
            google: googleSearchConsole.verificationContent,
          }
        : undefined,
  };
}

export default async function SiteRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings } = await getCachedSiteSettings();
  const { googleAnalytics, umami } = settings.analytics;

  return (
    <>
      <SiteLayout settings={settings}>{children}</SiteLayout>

      {isProduction() &&
        googleAnalytics.enabled &&
        googleAnalytics.measurementId && (
          <GoogleAnalytics gaId={googleAnalytics.measurementId} />
        )}

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
    </>
  );
}
