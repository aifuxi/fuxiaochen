import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import ArticleItem from '@/app/articles/article-item';
import EmptyArticleList from '@/app/articles/empty-article-list';
import { PageTitle, Pagination } from '@/components/rsc';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/constants';
import { getArticles } from '@/services';

export async function generateMetadata({
  params,
}: {
  params: { page: string };
}): Promise<Metadata> {
  return {
    title: `第${params.page}页 - 全部文章`,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: { page: string };
}) {
  const page = Number(params.page);

  if (page === DEFAULT_PAGE || page < 0 || isNaN(page)) {
    redirect('/articles');
  }

  const res = await getArticles({
    page,
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
