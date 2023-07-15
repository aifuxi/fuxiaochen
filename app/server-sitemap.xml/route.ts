import { getServerSideSitemap, type ISitemapField } from 'next-sitemap';

import { DEFAULT_PAGE_SIZE, DOMAIN } from '@/constants';
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

  const articlePageSitemaps: ISitemapField[] = generatePageSitemaps(
    `${DOMAIN}/articles/page`,
    articles?.length || 0,
  );

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

  return getServerSideSitemap([
    ...articlesSitemaps,
    ...articlePageSitemaps,
    ...tagsSitemaps,
  ]);
}

function generatePageSitemaps(prefix: string, total: number): ISitemapField[] {
  const totalPage = Math.ceil(total / DEFAULT_PAGE_SIZE);
  const pageSitemaps: ISitemapField[] = [];

  for (let i = 2; i <= totalPage; i++) {
    pageSitemaps.push({
      loc: `${prefix}/${i}`,
      changefreq: 'hourly',
    });
  }

  return pageSitemaps;
}
