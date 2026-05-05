import type { Metadata } from "next";

import { SiteLayout } from "@/components/site/site-layout";
import { SiteNotFoundStatus } from "@/components/site/site-not-found-status";

import { getCachedSiteSettings } from "@/lib/server/settings/service";
import { buildFullTitle } from "@/lib/settings/title";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getCachedSiteSettings();

  return {
    title: buildFullTitle(settings, "页面未找到"),
  };
}

export default async function NotFound() {
  return (
    <SiteLayout>
      <SiteNotFoundStatus />
    </SiteLayout>
  );
}
