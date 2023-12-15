import { type Metadata } from 'next';
import Link from 'next/link';

import { badgeVariants } from '@/components/ui/badge';

import { IllustrationNoContent } from '@/components/illustrations';
import { PageTitle } from '@/components/page-title';

import { cn } from '@/utils/helper';

import { PATHS } from '@/constants/path';

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
          <IllustrationNoContent className="w-[30vh] h-[30vh]" />
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center">
            暂无标签
          </h3>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-4">
        {tags?.map((tag) => (
          <Link
            href={`${PATHS.SITE_TAGS}/${tag.slug}`}
            key={tag.id}
            className={cn(
              badgeVariants({ variant: 'default' }),
              'text-md sm:px-4 sm:py-2 !rounded-none',
            )}
          >
            {tag.name}
          </Link>
        ))}
      </div>
    );
  }
}
