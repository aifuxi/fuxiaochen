'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ArrowRightIcon } from '@radix-ui/react-icons';

import { Button } from '@/components/ui/button';
import { PLACEHOLDER_COVER } from '@/constants';
import { type Article } from '@/types';
import { cn, formatToDate } from '@/utils';

type Props = {
  article: Article;
};

export default function ArticleItem({ article }: Props) {
  const router = useRouter();
  const articleUrl = `/articles/${article.friendlyUrl}`;

  return (
    <Link
      href={articleUrl}
      className={cn(
        'relative flex flex-col space-y-2 border-b p-4  md:p-8',
        'md:flex-row md:space-x-6 md:space-y-0',
        `after:absolute after:inset-0 after:w-0  after:z-[-1] after:hover:bg-primary-foreground after:hover:w-full after:transition-all after:duration-700`,
      )}
    >
      <div className="flex flex-col space-y-2 md:w-[280px]">
        <div className="overflow-hidden">
          <Image
            src={article.cover ? article.cover : PLACEHOLDER_COVER}
            alt={article.title}
            width="0"
            height="0"
            priority
            sizes="100vw"
            className="w-full h-auto hover:scale-105 transition-transform"
          />
        </div>
        <div className={cn('text-base font-medium text-primary/50')}>
          {formatToDate(new Date(article.createdAt))}
        </div>
      </div>
      <div className="flex flex-col space-y-2 md:flex-1">
        <h2 className="text-2xl font-bold">{article.title}</h2>
        <div className="flex space-x-4">
          {article.tags?.map((tag) => (
            <span
              key={tag.id}
              className={cn('text-sm font-medium cursor-pointer')}
              onClick={() => {
                router.push(`/tags/${tag.friendlyUrl}`);
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
        <div
          className={cn(
            'text-ellipsis overflow-hidden break-words line-clamp-3 text-primary/50',
          )}
        >
          {article.description}
        </div>
        <div className="pt-3">
          <Button
            onClick={() => {
              router.push(articleUrl);
            }}
            className="transition-transform duration-300 hover:scale-105 group/read-more"
          >
            阅读更多
            <ArrowRightIcon className="ml-2 h-4 w-4 transition-all duration-300 group-hover/read-more:ml-2.5" />
          </Button>
        </div>
      </div>
    </Link>
  );
}
