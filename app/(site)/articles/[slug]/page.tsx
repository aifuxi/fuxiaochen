import { notFound } from 'next/navigation';

import { isNil } from 'lodash-es';

import {
  ArticleDetailPage,
  getPlublishedArticleBySlug,
} from '@/features/article';

export const revalidate = 60;

export default async function Page({ params }: { params: { slug: string } }) {
  const { article } = await getPlublishedArticleBySlug(params.slug);

  if (isNil(article)) {
    return notFound();
  }

  return <ArticleDetailPage article={article} />;
}
