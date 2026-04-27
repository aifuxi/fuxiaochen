import { type Metadata } from "next";

import { getCachedPublicChangelogs } from "@/lib/server/public-content-cache";
import { getCachedSiteSettings } from "@/lib/server/settings/service";

import { ChangelogPageClient } from "./changelog-page-client";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getCachedSiteSettings();

  return settings.seo.pages.changelog;
}

export default async function ChangelogPage() {
  const { items } = await getCachedPublicChangelogs();

  return <ChangelogPageClient initialChangelogs={items} />;
}
