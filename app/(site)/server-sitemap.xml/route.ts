import { type ISitemapField, getServerSideSitemap } from 'next-sitemap';

import { PATHS } from '@/constants/path';
import { env } from '@/libs/env.mjs';
import { db } from '@/libs/prisma';

export async function GET() {
  const articles = await db.article.findMany({
    select: {
      friendlyURL: true,
      createdAt: true,
      updatedAt: true,
    },
    where: {
      published: true,
    },
  });
  const tags = await db.tag.findMany({
    select: {
      friendlyURL: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const articlesSitemaps = articles.map((item): ISitemapField => {
    return {
      loc: `${env.SITE_URL}${PATHS.SITE_ARTICLES}/${item.friendlyURL}`,
      lastmod: new Date(item.updatedAt ?? item.createdAt).toISOString(),
      changefreq: 'hourly',
    };
  });
  const tagsSitemaps = tags.map((item): ISitemapField => {
    return {
      loc: `${env.SITE_URL}${PATHS.SITE_TAGS}/${item.friendlyURL}`,
      lastmod: new Date(item.updatedAt ?? item.createdAt).toISOString(),
      changefreq: 'hourly',
    };
  });

  return getServerSideSitemap([...articlesSitemaps, ...tagsSitemaps]);
}
