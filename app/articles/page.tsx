import { Metadata } from 'next';

import { getServerSideArticles } from '@/app/fetch-data';
import { PageTitle, Pagination } from '@/components/rsc';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/constants';

import ArticleItem from './article-item';
import EmptyArticleList from './empty-article-list';

export const metadata: Metadata = {
  title: '文章',
};
export const revalidate = 60;

export default async function ArticlesPage() {
  const res = await getServerSideArticles({
    page: DEFAULT_PAGE,
    published: true,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const articles = res?.data;
  const total = res?.total || 0;

  return (
    <div className="container flex flex-col space-y-8">
      <PageTitle title="文章 / Articles" />
      {renderArticles()}
    </div>
  );

  function renderArticles() {
    if (!articles?.length) {
      return <EmptyArticleList />;
    }

    return (
      <>
        <p>
          共<span className="font-semibold px-1">{total}</span>
          篇文章
        </p>
        <ul className="flex flex-col">
          {articles?.map((article) => (
            <li key={article.id}>
              <ArticleItem article={article} />
            </li>
          ))}
        </ul>
        <Pagination currentPage={DEFAULT_PAGE} total={total} />
      </>
    );
  }
}
