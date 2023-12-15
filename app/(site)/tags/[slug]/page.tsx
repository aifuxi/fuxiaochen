import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import { isNil } from 'lodash-es';

import { getTagArticles, getTagBySlug } from '@/app/actions/tag';

import { PageTitle } from '@/components/page-title';

import { DEFAULT_PAGE } from '@/constants/unknown';

import ArticleList from '../../articles/article-list';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const tag = await getTagBySlug(params.slug);
  const name = tag?.name ?? '-';
  return {
    title: `${name}`,
  };
}

export const revalidate = 60;

export default async function TagDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { page } = searchParams ?? {};
  const currentPage = typeof page === 'string' ? parseInt(page) : DEFAULT_PAGE;

  const tag = await getTagBySlug(params.slug);

  if (isNil(tag)) {
    return notFound();
  }

  const { articles, total } = await getTagArticles({
    slug: params.slug,
    page: currentPage,
  });

  return (
    <div className="container mx-auto">
      <div className="min-h-screen flex flex-col gap-8 pb-8">
        <PageTitle title={tag.name} />

        <ArticleList articles={articles} total={total} />
      </div>
    </div>
  );
}
