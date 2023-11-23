import { type Metadata } from 'next';
import Link from 'next/link';

import { PageTitle } from '@/components/rsc';
import { cn } from '@/utils';

import { getTagsWithArticleCountAction } from '../_actions/tag';

export const metadata: Metadata = {
  title: '标签',
};

export const revalidate = 60;

export default async function TagsPage() {
  const tags = await getTagsWithArticleCountAction();

  return (
    <div className={cn('container flex flex-col h-screen space-y-8')}>
      <PageTitle title="标签 / Tags" />
      {renderTagList()}
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
                'mr-4 mb-4 text-sm font-medium transition-colors',
                'text-primary/50 hover:text-primary',
              )}
              href={`/tags/${tag.friendlyUrl}`}
            >
              {tag.name}
              <span className={cn('text-sm font-semibold ml-2')}>
                ({tag.articles.length ?? 0})
              </span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }
}
