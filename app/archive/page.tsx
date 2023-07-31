import React from 'react';

import { Metadata } from 'next';
import Link from 'next/link';

import { PageTitle } from '@/components/rsc';
import { formatToDate } from '@/utils';

import { getServerSideArticleArchive } from '../fetch-data';

export const metadata: Metadata = {
  title: '归档',
};

export const revalidate = 60;

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
    const total = years?.reduce((prev, current) => {
      return prev + (archive[current]?.length || 0);
    }, 0);

    return (
      <div className="prose max-w-none dark:prose-invert">
        <h2>总共写了 {total} 篇文章，继续努力！</h2>

        {years.map((year) => {
          const articles = archive[year];
          return (
            <div key={year}>
              <h2>
                {year}年（{articles?.length || 0}篇）
              </h2>
              <ul>
                {articles.map((article) => (
                  <li key={article.id}>
                    <Link href={`/articles/${article.friendlyUrl}`}>
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
