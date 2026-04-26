import { type Metadata } from "next";

import { settingsService } from "@/lib/server/settings/service";

import { FriendsPageClient } from "./friends-page-client";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await settingsService.getSettings();

  return settings.seo.pages.friends;
}

export default function FriendsPage() {
  return <FriendsPageClient />;
}
