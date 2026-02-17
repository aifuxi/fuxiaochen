import { type ISitemapField, getServerSideSitemap } from "next-sitemap";
import { getBlogsAction } from "@/app/actions/blog";

export async function GET() {
  const { data } = await getBlogsAction({
    page: 1,
    pageSize: 10000,
  });

  const blogs = data?.lists || [];

  const blogsSitemaps = blogs.map((item): ISitemapField => {
    return {
      loc: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${item.slug}`,
      lastmod: new Date(item.updatedAt).toISOString(),
      changefreq: "hourly",
    };
  });

  return getServerSideSitemap([...blogsSitemaps]);
}
