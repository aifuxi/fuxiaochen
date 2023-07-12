import Link from 'next/link';

import { PageTitle } from '@/components/rsc';
import { DEFAULT_PAGE, LATEST_ARTICLES_PAGE_SIZE } from '@/constants';
import { getArticles } from '@/services';
import { cn } from '@/utils';

import ArticleItem from './articles/article-item';

export default async function HomePage() {
  const res = await getArticles({
    page: DEFAULT_PAGE,
    published: true,
    pageSize: LATEST_ARTICLES_PAGE_SIZE,
  });
  const articles = res?.data;

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-136px)] justify-center items-center">
        <img
          src="/images/nyan-cat.gif"
          alt="Nyan Cat"
          className={cn('w-full h-auto')}
        />
        <div className="flex">
          <h1
            className={cn(
              'flex font-semibold overflow-hidden whitespace-nowrap animate-typing',
              'text-xl sm:text-4xl 2xl:text-5xl',
            )}
          >
            F西，努力做一个更好的程序员。
          </h1>
          <span
            className={cn(
              'ml-2 w-2 h-full animate-blink',
              'bg-gray-900 dark:bg-white',
            )}
          />
        </div>
      </div>
      {renderLatestArticles()}
    </>
  );

  function renderLatestArticles() {
    if (!articles?.length) {
      return null;
    }

    return (
      <div className="flex flex-col space-y-8 pt-8">
        <PageTitle title="最新文章" />
        <ul className="flex flex-col space-y-10">
          {articles?.map((article) => (
            <li key={article.id}>
              <ArticleItem article={article} />
            </li>
          ))}
        </ul>
        <div className="text-base font-medium leading-6 text-right">
          <Link
            className={cn(
              'text-primary-500 font-medium ',
              'hover:text-primary-600 dark:hover:text-primary-400',
            )}
            href={`/articles`}
          >
            全部文章 →
          </Link>
        </div>
      </div>
    );
  }
}
