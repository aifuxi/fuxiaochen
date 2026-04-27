import { FeaturedPosts } from "@/components/featured-posts";
import { Hero } from "@/components/hero";
import { RecentPosts } from "@/components/recent-posts";

import {
  getCachedFeaturedBlogs,
  getCachedRecentBlogs,
} from "@/lib/server/public-content-cache";
import { getCachedSiteSettings } from "@/lib/server/settings/service";

export default async function Page() {
  const [{ settings }, featuredBlogs, recentBlogs] = await Promise.all([
    getCachedSiteSettings(),
    getCachedFeaturedBlogs(),
    getCachedRecentBlogs(),
  ]);

  return (
    <>
      <Hero settings={settings} />
      <FeaturedPosts initialPosts={featuredBlogs.items} />
      <RecentPosts initialPosts={recentBlogs.items} />
    </>
  );
}
