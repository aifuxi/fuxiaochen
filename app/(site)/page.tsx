import { FeaturedPosts } from "@/components/featured-posts";
import { Hero } from "@/components/hero";
import { RecentPosts } from "@/components/recent-posts";

import { getCachedSiteSettings } from "@/lib/server/settings/service";

export default async function Page() {
  const { settings } = await getCachedSiteSettings();

  return (
    <>
      <Hero settings={settings} />
      <FeaturedPosts />
      <RecentPosts />
    </>
  );
}
