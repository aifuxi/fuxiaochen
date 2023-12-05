import Link from 'next/link';

import { Heading, Link as RadixLink } from '@radix-ui/themes';

import { EditForm } from './edit-form';
import { getArticle } from '@/app/_actions/article';
import { getAllTags } from '@/app/_actions/tag';
import { PATHS } from '@/constants';

export default async function AdminArticleCreate({
  params,
}: {
  params: { id: string };
}) {
  const tags = await getAllTags();
  const article = await getArticle(params.id);

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
          编辑文章
        </Heading>
      </div>

      <EditForm article={article ?? undefined} tags={tags} />
    </div>
  );
}
