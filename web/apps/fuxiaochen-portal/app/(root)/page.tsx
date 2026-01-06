import { BlogGrid } from "@/components/blog/blog-grid";
import { BlogHero } from "@/components/blog/blog-hero";
import { FeaturedPost } from "@/components/blog/featured-post";

import { getBlogList } from "@/api/blog";

export default async function Page() {
  const [recentBlogResp, featuredBlogResp] = await Promise.all([
    getBlogList({
      page: 1,
      pageSize: 10,
    }),
    getBlogList({
      page: 1,
      pageSize: 10,
      featuredStatus: "featured",
    }),
  ]);

  const recentBlogs = recentBlogResp?.lists?.slice(0, 6) || [];
  const featuredBlogs = featuredBlogResp?.lists.slice(0, 1) || [];

  return (
    <div className="min-h-[calc(100vh-64px)]">
      <BlogHero />
      <div className="container mx-auto px-4 py-16">
        <FeaturedPost blogs={featuredBlogs} />
        <BlogGrid blogs={recentBlogs} title="最近发布" />
      </div>
    </div>
  );
}
