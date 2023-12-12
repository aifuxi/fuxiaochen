import { type Metadata } from 'next';

import { getTagArticles, getTagByFriendlyURL } from '@/app/actions/tag';
import { PageTitle } from '@/components/page-title';
import { DEFAULT_PAGE } from '@/constants/unknown';

import ArticleList from '../../articles/article-list';

export async function generateMetadata({
  params,
}: {
  params: { friendlyURL: string };
}): Promise<Metadata> {
  const tag = await getTagByFriendlyURL(params.friendlyURL);
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
  params: { friendlyURL: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { page } = searchParams ?? {};
  const currentPage = typeof page === 'string' ? parseInt(page) : DEFAULT_PAGE;

  const tag = await getTagByFriendlyURL(params.friendlyURL);
  const { articles, total } = await getTagArticles({
    friendlyURL: params.friendlyURL,
    page: currentPage,
  });

  return (
    <div className="container mx-auto">
      <div className="min-h-screen flex flex-col gap-8 pb-8">
        <PageTitle title={tag?.name ?? '-'} />

        <ArticleList articles={articles} total={total} />
      </div>
    </div>
  );
}
