import { type Metadata } from "next";

import { getCachedPublicFriends } from "@/lib/server/public-content-cache";
import { getCachedSiteSettings } from "@/lib/server/settings/service";

import { FriendsPageClient } from "./friends-page-client";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getCachedSiteSettings();

  return settings.seo.pages.friends;
}

export default async function FriendsPage() {
  const [{ settings }, friends] = await Promise.all([
    getCachedSiteSettings(),
    getCachedPublicFriends(),
  ]);

  return (
    <FriendsPageClient settings={settings} initialFriends={friends.items} />
  );
}
