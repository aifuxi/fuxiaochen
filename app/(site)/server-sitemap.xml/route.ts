import { type ISitemapField, getServerSideSitemap } from 'next-sitemap';

import { env } from '@/libs/env.mjs';
import { db } from '@/libs/prisma';

import { PATHS } from '@/constants/path';

export async function GET() {
  const articles = await db.article.findMany({
    select: {
      slug: true,
      createdAt: true,
      updatedAt: true,
    },
    where: {
      published: true,
    },
  });
  const tags = await db.tag.findMany({
    select: {
      slug: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const firstArticle = articles[0]?.createdAt;

  const articlesSitemaps = articles.map((item): ISitemapField => {
    return {
      loc: `${env.SITE_URL}${PATHS.SITE_ARTICLES}/${item.slug}`,
      lastmod: new Date(item.updatedAt ?? item.createdAt).toISOString(),
      changefreq: 'hourly',
    };
  });
  const tagsSitemaps = tags.map((item): ISitemapField => {
    return {
      loc: `${env.SITE_URL}${PATHS.SITE_TAGS}/${item.slug}`,
      lastmod: new Date(item.updatedAt ?? item.createdAt).toISOString(),
      changefreq: 'hourly',
    };
  });

  return getServerSideSitemap([
    {
      loc: `${env.SITE_URL}${PATHS.SITE_ARTICLES}`,
      lastmod: firstArticle?.toISOString(),
      changefreq: 'hourly',
    },
    ...articlesSitemaps,
    ...tagsSitemaps,
  ]);
}
