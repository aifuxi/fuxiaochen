import { type Metadata } from 'next';
import Link from 'next/link';

import { IllustrationNoContent } from '@/components/illustrations';
import { PageTitle } from '@/components/page-title';
import { badgeVariants } from '@/components/ui/badge';
import { PATHS } from '@/constants/path';
import { cn } from '@/utils';

import { getAllTags } from '../../actions/tag';

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
      return (
        <div className="grid gap-8 place-content-center">
          <IllustrationNoContent className="w-[400px] h-[400px]" />
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center">
            暂无标签，请添加
          </h3>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-4">
        {tags?.map((tag) => (
          <Link
            href={`${PATHS.SITE_TAGS}/${tag.friendlyURL}`}
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
