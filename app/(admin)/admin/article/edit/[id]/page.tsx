import Link from 'next/link';

import { Flex, Heading, Link as RadixLink } from '@radix-ui/themes';

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
    <Flex gap={'4'} direction={'column'}>
      <Flex gap={'4'} align={'center'}>
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
      </Flex>

      <EditForm article={article ?? undefined} tags={tags} />
    </Flex>
  );
}
