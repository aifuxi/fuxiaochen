import { type ISitemapField, getServerSideSitemap } from "next-sitemap";

import { getBlogList } from "@/api/blog";

export async function GET() {
  const { lists } = await getBlogList({
    page: 1,
    pageSize: 10000,
  });

  const blogs = lists || [];

  const blogsSitemaps = blogs.map((item): ISitemapField => {
    return {
      loc: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${item.slug}`,
      lastmod: new Date(item.updatedAt).toISOString(),
      changefreq: "hourly",
    };
  });

  return getServerSideSitemap([...blogsSitemaps]);
}
