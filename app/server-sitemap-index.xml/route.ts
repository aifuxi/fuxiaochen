import { type ISitemapField, getServerSideSitemap } from "next-sitemap";

import { getBlogList } from "@/api/blog";
import { PATHS } from "@/constants";

export async function GET() {
  const resp = await getBlogList({
    page: 1,
    pageSize: 10000,
  });

  const { lists = [] } = resp.data;

  const blogsSitemaps = lists.map((item): ISitemapField => {
    return {
      loc: `${PATHS.BLOG}/${item.slug}`,
      lastmod: new Date(item.updatedAt).toISOString(),
      changefreq: "hourly",
    };
  });

  return getServerSideSitemap([...blogsSitemaps]);
}
