import { type Metadata } from 'next';
import Link from 'next/link';

import { Badge, Container, Flex } from '@radix-ui/themes';

import { PageTitle } from '@/components/rsc';
import { PATHS } from '@/constants';

import { getAllTags } from '../../_actions/tag';

export const metadata: Metadata = {
  title: '标签',
};

export const revalidate = 60;

export default async function TagsPage() {
  const tags = await getAllTags();

  return (
    <Container size={'4'}>
      <Flex direction={'column'} gap={'8'} className={'h-screen'}>
        <PageTitle title="标签" />

        {renderTagList()}
      </Flex>
    </Container>
  );

  function renderTagList() {
    if (!tags?.length) {
      return <div className="pl-8 pt-16">暂无标签</div>;
    }

    return (
      <Flex wrap={'wrap'} gap={'4'}>
        {tags?.map((tag) => (
          <Link href={`${PATHS.SITE_TAGS}/${tag.friendlyUrl}`} key={tag.id}>
            <Badge size={'2'} color="gray" style={{ cursor: 'pointer' }}>
              {tag.name}
            </Badge>
          </Link>
        ))}
      </Flex>
    );
  }
}
