import { type Metadata } from 'next';
import Link from 'next/link';

import { PageTitle } from '@/components/page-title';
import { badgeVariants } from '@/components/ui/badge';
import { PATHS } from '@/constants/path';
import { cn } from '@/utils';

import { getAllTags } from '../../_actions/tag';

export const metadata: Metadata = {
  title: '标签',
};

export const revalidate = 60;

export default async function TagsPage() {
  const tags = await getAllTags();

  return (
    <div className="container mx-auto">
      <div className="h-screen flex flex-col gap-8 pb-8">
        <PageTitle title="标签" />

        {renderTagList()}
      </div>
    </div>
  );

  function renderTagList() {
    if (!tags?.length) {
      return <div className="pl-8 pt-16">暂无标签</div>;
    }

    return (
      <div className="flex flex-wrap gap-4">
        {tags?.map((tag) => (
          <Link
            href={`${PATHS.SITE_TAGS}/${tag.friendlyUrl}`}
            key={tag.id}
            className={cn(
              badgeVariants({ variant: 'default' }),
              'text-md px-4 py-2 !rounded-none',
            )}
          >
            {tag.name}
          </Link>
        ))}
      </div>
    );
  }
}
