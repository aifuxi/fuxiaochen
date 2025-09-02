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
  const snippets = await prisma.snippet.findMany({
    select: {
      slug: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const blogsSitemaps = blogs.map((item): ISitemapField => {
    return {
      loc: `${PATHS.SITE_BLOG}/${item.slug}`,
      lastmod: new Date(item.updatedAt).toISOString(),
      changefreq: "hourly",
    };
  });
  const snippetsSitemaps = snippets.map((item): ISitemapField => {
    return {
      loc: `${PATHS.SITE_SNIPPET}/${item.slug}`,
      lastmod: new Date(item.updatedAt).toISOString(),
      changefreq: "hourly",
    };
  });

  return getServerSideSitemap([...blogsSitemaps, ...snippetsSitemaps]);
}
