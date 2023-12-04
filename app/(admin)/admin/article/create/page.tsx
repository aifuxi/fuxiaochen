import Link from 'next/link';

import { Flex, Heading, Link as RadixLink } from '@radix-ui/themes';

import { CreateForm } from './create-form';
import { getAllTags } from '@/app/_actions/tag';
import { PATHS } from '@/constants';

export default async function AdminArticleCreate() {
  const tags = await getAllTags();

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
          创建文章
        </Heading>
      </Flex>

      <CreateForm tags={tags} />
    </Flex>
  );
}
