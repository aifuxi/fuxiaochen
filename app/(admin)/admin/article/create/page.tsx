import Link from 'next/link';

import { Heading, Link as RadixLink } from '@radix-ui/themes';

import { CreateForm } from './create-form';
import { getAllTags } from '@/app/_actions/tag';
import { PATHS } from '@/constants';

export default async function AdminArticleCreate() {
  const tags = await getAllTags();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <RadixLink asChild color="gray">
          <Link href={PATHS.ADMIN_ARTICLE}>
            <Heading size={'6'} as="h4">
              文章管理
            </Heading>
          </Link>
        </RadixLink>

        <Heading size={'6'} as="h4" color="gray">
          /
        </Heading>
        <Heading size={'6'} as="h4">
          创建文章
        </Heading>
      </div>

      <CreateForm tags={tags} />
    </div>
  );
}
