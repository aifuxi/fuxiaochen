import { FeaturedPosts } from "@/components/featured-posts";
import { Hero } from "@/components/hero";
import { RecentPosts } from "@/components/recent-posts";

export default function Page() {
  return (
    <>
      <Hero />
      <FeaturedPosts />
      <RecentPosts />
    </>
  );
}
