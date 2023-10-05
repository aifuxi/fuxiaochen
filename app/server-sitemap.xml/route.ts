import { getServerSideSitemap, type ISitemapField } from 'next-sitemap';

import { DOMAIN } from '@/constants';
import prisma from '@/libs/prisma';

export async function GET() {
  const articles = await prisma.article.findMany({
    select: {
      friendlyUrl: true,
      createdAt: true,
      updatedAt: true,
    },
    where: {
      published: true,
    },
  });
  const tags = await prisma.tag.findMany({
    select: {
      friendlyUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const articlesSitemaps = articles.map((item): ISitemapField => {
    return {
      loc: `${DOMAIN}/articles/${item.friendlyUrl}`,
      lastmod: new Date(item.updatedAt || item.createdAt).toISOString(),
      changefreq: 'hourly',
    };
  });
  const tagsSitemaps = tags.map((item): ISitemapField => {
    return {
      loc: `${DOMAIN}/tags/${item.friendlyUrl}`,
      lastmod: new Date(item.updatedAt || item.createdAt).toISOString(),
      changefreq: 'hourly',
    };
  });

  return getServerSideSitemap([...articlesSitemaps, ...tagsSitemaps]);
}
