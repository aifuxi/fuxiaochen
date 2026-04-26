import { type Metadata } from "next";

import { settingsService } from "@/lib/server/settings/service";

import { ChangelogPageClient } from "./changelog-page-client";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await settingsService.getSettings();

  return settings.seo.pages.changelog;
}

export default function ChangelogPage() {
  return <ChangelogPageClient />;
}
