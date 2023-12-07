import { type ISitemapField, getServerSideSitemap } from 'next-sitemap';

import { DOMAIN } from '@/constants/info';
import { db } from '@/libs/prisma';

export async function GET() {
  const articles = await db.article.findMany({
    select: {
      friendlyUrl: true,
      createdAt: true,
      updatedAt: true,
    },
    where: {
      published: true,
    },
  });
  const tags = await db.tag.findMany({
    select: {
      friendlyUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const articlesSitemaps = articles.map((item): ISitemapField => {
    return {
      loc: `${DOMAIN}/articles/${item.friendlyUrl}`,
      lastmod: new Date(item.updatedAt ?? item.createdAt).toISOString(),
      changefreq: 'hourly',
    };
  });
  const tagsSitemaps = tags.map((item): ISitemapField => {
    return {
      loc: `${DOMAIN}/tags/${item.friendlyUrl}`,
      lastmod: new Date(item.updatedAt ?? item.createdAt).toISOString(),
      changefreq: 'hourly',
    };
  });

  return getServerSideSitemap([...articlesSitemaps, ...tagsSitemaps]);
}
