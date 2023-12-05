import Link from 'next/link';

import { type Article, type Tag } from '@prisma/client';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import { Badge, Button, Heading, Text } from '@radix-ui/themes';

import { PATHS, PLACEHOLDER_COVER } from '@/constants';
import { cn, formatToDate } from '@/utils';

type Props = {
  article: Article & { tags?: Tag[] };
};

export default function ArticleItem({ article }: Props) {
  return (
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
      <div className="flex flex-col gap-3 flex-1">
        <Heading as="h4" size={'5'}>
          {article.title}
        </Heading>

        <div className="flex flex-wrap gap-4">
          {article.tags?.map((tag) => (
            <Badge key={tag.id} color="gray">
              {tag.name}
            </Badge>
          ))}
        </div>

        <Text color="gray" size={'2'}>
          {article.description}
        </Text>

        <div className="flex flex-col justify-end flex-1">
          <div className="flex justify-between items-center">
            <Text color="gray" size={'2'}>
              {formatToDate(new Date(article.createdAt))}
            </Text>

            <Button color="gray" highContrast size={'3'}>
              阅读更多
              <ArrowRightIcon className="ml-2 h-4 w-4 transition-all duration-300 group-hover/read-more:ml-2.5" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
