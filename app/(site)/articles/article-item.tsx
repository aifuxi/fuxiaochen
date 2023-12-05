import Link from 'next/link';

import { ArrowRightIcon } from '@radix-ui/react-icons';
import { Badge, Button, Flex, Heading, Text } from '@radix-ui/themes';

import { PATHS, PLACEHOLDER_COVER } from '@/constants';
import { type Article } from '@/typings/params';
import { cn, formatToDate } from '@/utils';

type Props = {
  article: Article;
};

export default function ArticleItem({ article }: Props) {
  return (
    <Flex asChild>
      <Link
        href={`${PATHS.SITE_ARTICLES}/${article.friendlyUrl}`}
        className={cn(
          'relative flex flex-col space-y-2 border-b border-b-gray-6 p-4  md:p-8',
          'md:flex-row md:space-x-6 md:space-y-0',
          `after:absolute after:inset-0 after:w-0  after:z-[-1] after:hover:bg-gray-2 after:hover:w-full after:transition-all after:duration-700`,
        )}
      >
        <img
          src={article.cover ? article.cover : PLACEHOLDER_COVER}
          alt={article.title}
          className="w-[300px]"
        />
        <Flex direction={'column'} gap={'3'} grow={'1'}>
          <Heading as="h4" size={'5'}>
            {article.title}
          </Heading>

          <Flex wrap={'wrap'} gap={'4'}>
            {article.tags?.map((tag) => (
              <Badge key={tag.id} color="gray">
                {tag.name}
              </Badge>
            ))}
          </Flex>

          <Text color="gray" size={'2'}>
            {article.description}
          </Text>

          <Flex grow={'1'} direction={'column'} justify={'end'}>
            <Flex justify={'between'} align={'center'}>
              <Text color="gray" size={'2'}>
                {formatToDate(new Date(article.createdAt))}
              </Text>

              <Button color="gray" highContrast size={'3'}>
                阅读更多
                <ArrowRightIcon className="ml-2 h-4 w-4 transition-all duration-300 group-hover/read-more:ml-2.5" />
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Link>
    </Flex>
  );
}
