import { Metadata } from 'next';
import Link from 'next/link';

import { getServerSideTags } from '@/app/fetch-data';
import { GiscusComment } from '@/components/client';
import { PageTitle } from '@/components/rsc';
import { DEFAULT_PAGE, MAX_PAGE_SIZE } from '@/constants';
import { cn } from '@/utils';

export const metadata: Metadata = {
  title: '标签',
};

export const revalidate = 60;

export default async function TagsPage() {
  const data = await getServerSideTags({
    page: DEFAULT_PAGE,
    pageSize: MAX_PAGE_SIZE,
  });

  const tags = data.data;

  return (
    <>
      <div
        className={cn(
          'flex min-h-[68vh]',
          'flex-col sm:flex-row sm:items-center',
          'space-y-8 sm:space-y-0 sm:space-x-8 ',
          'sm:divide-x-4',
        )}
      >
        <PageTitle
          title="标签"
          className={cn('sm:border-b-0 sm:whitespace-nowrap')}
        />
        {renderTagList()}
      </div>
      <GiscusComment />
    </>
  );

  function renderTagList() {
    if (!tags?.length) {
      return <div className="pl-8">暂无标签</div>;
    }

    return (
      <ul className={cn('flex flex-wrap ', 'sm:pl-8')}>
        {tags?.map((tag) => (
          <li key={tag.id} className="flex space-x-2 ">
            <Link
              className={cn(
                'mr-4 mb-4 text-sm font-medium text-primary-500 ',
                'hover:text-primary-600 dark:hover:text-primary-400',
              )}
              href={`/tags/${tag.friendlyUrl}`}
            >
              {tag.name}
              <span
                className={cn(
                  'text-sm font-semibold ml-2',
                  'text-gray-500 dark:text-gray-400',
                )}
              >
                ({tag.articleCount || 0})
              </span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }
}
