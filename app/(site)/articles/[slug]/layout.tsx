import { type Metadata } from 'next';

import { isNil } from 'lodash-es';

import { WEBSITE } from '@/config';

import { type FCProps } from '@/types';

import { getPlublishedArticleBySlug } from '@/features/article';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { article } = await getPlublishedArticleBySlug(params.slug);

  if (isNil(article)) {
    return {};
  }

  return {
    title: `${article.title} · ${WEBSITE}`,
    description: article.description,
    keywords: article.tags.map((el) => el.name).join(','),
  };
}

export default function Layout({ children }: FCProps) {
  return <>{children}</>;
}
