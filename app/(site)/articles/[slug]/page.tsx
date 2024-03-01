import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import { isNil } from 'lodash-es';

import { getArticleBySlug } from '@/app/actions/article';

import { BytemdViewer } from '@/components/bytemd';
import { GoBack } from '@/components/go-back';

import { env } from '@/libs/env.mjs';

import { getOpenGraphImage } from '@/utils/helper';

import { PATHS } from '@/constants/path';
import { PLACEHOLDER_COVER } from '@/constants/unknown';

import { ArticleTOC } from './article-toc';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    return {};
  }

  return {
    title: article.title,
    description: article.description,
    keywords: article?.tags?.map((el) => el.name).join(','),
    metadataBase: new URL(env.SITE_URL),
    openGraph: {
      type: 'article',
      url: `${env.SITE_URL}${PATHS.SITE_ARTICLES}/${article.slug}`,
      title: article.title,
      description: article.description,
      tags: article?.tags?.map((el) => el.name),
      images: [
        {
          url: getOpenGraphImage(article.cover),
        },
      ],
    },
  };
}

export const revalidate = 60;

export default async function ArticleDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticleBySlug(params.slug);

  if (isNil(article)) {
    return notFound();
  }

  return (
    <div className="flex lg:justify-between max-w-[1140px] px-4 lg:mx-auto lg:space-x-8">
      <ArticleTOC />
      <div className="flex flex-1 flex-col gap-y-4 pt-12">
        <img
          className="object-fill border"
          src={article?.cover ?? PLACEHOLDER_COVER}
          alt={article?.title}
        />

        <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight lg:text-5xl">
          {article?.title}
        </h1>
        <BytemdViewer content={article.content ?? ''} />

        <div className="flex">
          <GoBack />
        </div>
      </div>
    </div>
  );
}
