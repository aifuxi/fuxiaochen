import { FeaturedPosts } from "@/components/featured-posts";
import { Hero } from "@/components/hero";
import { RecentPosts } from "@/components/recent-posts";

import { settingsService } from "@/lib/server/settings/service";

export default async function Page() {
  const { settings } = await settingsService.getSettings();

  return (
    <>
      <Hero settings={settings} />
      <FeaturedPosts />
      <RecentPosts />
    </>
  );
}
