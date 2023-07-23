import React from 'react';

import { Metadata } from 'next';
import Link from 'next/link';

import { PageTitle } from '@/components/rsc';
import { cn, formatToDate } from '@/utils';

import { getServerSideArticleArchive } from '../fetch-data';

export const metadata: Metadata = {
  title: '归档',
};

export default async function ArchivePage() {
  const archive = await getServerSideArticleArchive();

  return (
    <div className="flex flex-col space-y-8">
      <PageTitle title="归档" />

      {renderArticleArchive()}
    </div>
  );

  function renderArticleArchive() {
    if (!archive) {
      return <div className="">暂无文章</div>;
    }

    const years = Object.keys(archive);

    return (
      <div className="prose max-w-none dark:prose-invert">
        {years.map((year) => {
          const articles = archive[year];
          return (
            <div key={year}>
              <h2>{year}：</h2>
              <ul>
                {articles.map((article) => (
                  <li key={article.id}>
                    <Link
                      href={`/articles/${article.friendlyUrl}`}
                      className={cn(
                        '!no-underline',
                        'text-gray-500 dark:text-gray-400',
                        'hover:!text-600 dark:hover:!text-gray-200',
                      )}
                    >
                      {formatToDate(new Date(article.createdAt))}
                      &nbsp;&nbsp;
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    );
  }
}
