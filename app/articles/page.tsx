import { Metadata } from 'next';

import { PageTitle, Pagination } from '@/components/rsc';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/constants';
import { getArticles } from '@/services';

import ArticleItem from './article-item';
import EmptyArticleList from './empty-article-list';

export const metadata: Metadata = {
  title: '全部文章',
};

export default async function ArticlesPage() {
  const res = await getArticles({
    page: DEFAULT_PAGE,
    published: true,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const articles = res?.data;
  const total = res?.total || 0;

  return (
    <div className="flex flex-col space-y-8">
      <PageTitle title="全部文章" />
      {renderArticles()}
    </div>
  );

  function renderArticles() {
    if (!articles?.length) {
      return <EmptyArticleList />;
    }

    return (
      <>
        <p className="prose">
          共<span className="font-semibold px-1">{total}</span>篇文章
        </p>
        <ul className="flex flex-col space-y-10">
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
