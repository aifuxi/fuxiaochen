import Image from 'next/image';
import Link from 'next/link';

import { PLACEHOLDER_COVER, UMT_SOURCE } from '@/constants';
import { Article } from '@/types';
import { cn, formatToDate, obj2QueryString } from '@/utils';

type Props = {
  article: Article;
  umtSource?: string;
};

export default function ArticleItem({ article, umtSource }: Props) {
  const articleUrl = `/articles/${article.friendlyUrl}${
    umtSource
      ? obj2QueryString({
          [UMT_SOURCE]: umtSource,
        })
      : ''
  }`;

  return (
    <article
      className={cn(
        'flex flex-col space-y-2',
        'md:flex-row md:space-x-6 md:space-y-0',
      )}
    >
      <div className="flex flex-col space-y-2 md:w-[280px]">
        <Link href={articleUrl} className="overflow-hidden">
          <Image
            src={article.cover ? article.cover : PLACEHOLDER_COVER}
            alt={article.title}
            width="0"
            height="0"
            priority
            sizes="100vw"
            className="w-full h-auto rounded hover:scale-105 transition-transform"
          />
        </Link>
        <div
          className={cn(
            'text-base font-medium leading-6 ',
            'text-gray-500 dark:text-gray-400',
          )}
        >
          {formatToDate(new Date(article.createdAt))}
        </div>
      </div>
      <div className="flex flex-col space-y-2 md:flex-1">
        <h2 className="text-2xl font-bold leading-8 tracking-tight hover:underline">
          <Link href={articleUrl}>{article.title}</Link>
        </h2>
        <div className="flex space-x-4">
          {article.tags?.map((tag) => (
            <Link
              key={tag.id}
              className={cn(
                'text-sm font-medium ',
                'text-primary-500 hover:text-primary-600 dark:hover:text-primary-400',
              )}
              href={`/tags/${tag.friendlyUrl}`}
            >
              {tag.name}
            </Link>
          ))}
        </div>
        <div
          className={cn(
            'prose text-ellipsis overflow-hidden break-words line-clamp-3 ',
            'md:max-w-[100ch]',
            'text-gray-500 dark:text-gray-400',
          )}
        >
          {article.description}
        </div>
        <div className="text-base font-medium leading-6">
          <Link
            className={cn(
              'text-primary-500 ',
              'hover:text-primary-600 dark:hover:text-primary-400',
            )}
            href={articleUrl}
          >
            查看更多 →
          </Link>
        </div>
      </div>
    </article>
  );
}
