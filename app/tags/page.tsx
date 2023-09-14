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
    <div className={cn('container flex flex-col h-screen space-y-8')}>
      <PageTitle title="标签 / Tags" />
      {renderTagList()}
      <GiscusComment />
    </div>
  );

  function renderTagList() {
    if (!tags?.length) {
      return <div className="pl-8 pt-16">暂无标签</div>;
    }

    return (
      <ul className={cn('flex flex-wrap  pt-16')}>
        {tags?.map((tag) => (
          <li key={tag.id} className="flex space-x-2 ">
            <Link
              className={cn(
                'mr-4 mb-4 text-sm font-medium',
                'text-primary/50 hover:text-primary',
              )}
              href={`/tags/${tag.friendlyUrl}`}
            >
              {tag.name}
              <span className={cn('text-sm font-semibold ml-2')}>
                ({tag.articleCount || 0})
              </span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }
}
