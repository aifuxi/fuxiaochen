import { type ISitemapField, getServerSideSitemap } from 'next-sitemap';

import { env } from '@/libs/env.mjs';
import { db } from '@/libs/prisma';

import { PATHS } from '@/constants/path';
import { DEFAULT_PAGE_SIZE } from '@/constants/unknown';

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

  const articlePages = Math.ceil((articles?.length || 0) / DEFAULT_PAGE_SIZE);
  const articlePagesSitemaps: ISitemapField[] = [];
  const firstArticle = articles[0]?.createdAt;

  for (let i = 1; i <= articlePages; i++) {
    if (i === 1) {
      articlePagesSitemaps.push({
        loc: `${env.SITE_URL}${PATHS.SITE_ARTICLES}`,
        lastmod: firstArticle?.toISOString(),
        changefreq: 'hourly',
      });
    } else {
      articlePagesSitemaps.push({
        loc: `${env.SITE_URL}${PATHS.SITE_ARTICLES}?page=${i}`,
        lastmod: firstArticle?.toISOString(),
        changefreq: 'hourly',
      });
    }
  }

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
    ...articlesSitemaps,
    ...tagsSitemaps,
    ...articlePagesSitemaps,
  ]);
}
