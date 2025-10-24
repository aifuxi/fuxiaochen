import { type ISitemapField, getServerSideSitemap } from "next-sitemap";

import { PATHS } from "@/constants";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const blogs = await prisma.blog.findMany({
    select: {
      slug: true,
      createdAt: true,
      updatedAt: true,
    },
    where: {
      published: true,
    },
  });

  const blogsSitemaps = blogs.map((item): ISitemapField => {
    return {
      loc: `${PATHS.BLOG}/${item.slug}`,
      lastmod: new Date(item.updatedAt).toISOString(),
      changefreq: "hourly",
    };
  });

  return getServerSideSitemap([...blogsSitemaps]);
}
