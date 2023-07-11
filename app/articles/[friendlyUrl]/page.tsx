import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { BytemdViewer } from '@/components/client';
import { PageTitle, PreviewImage } from '@/components/rsc';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  PLACEHOLDER_COVER,
} from '@/constants';
import { getArticles } from '@/services';
import { cn, formatToDateTime, isNil } from '@/utils';

import EmptyArticle from './empty-article';

export async function generateMetadata({
  params,
}: {
  params: { friendlyUrl: string };
}): Promise<Metadata> {
  const data = await getArticles({
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    friendlyUrl: params.friendlyUrl,
    published: true,
  });
  const currentArticle = data.data?.[0];
  return {
    title: `${currentArticle?.title}`,
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: { friendlyUrl: string };
}) {
  const data = await getArticles({
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    friendlyUrl: params.friendlyUrl,
    published: true,
  });
  const currentArticle = data.data?.[0];

  if (isNil(currentArticle)) {
    return <EmptyArticle />;
  }

  return (
    <div>
      <div className="text-center text-base font-medium leading-6 tracking-wider text-gray-500">
        {formatToDateTime(currentArticle.createdAt)}
      </div>
      <PageTitle title={currentArticle.title} className="text-center" />
      <div className="flex justify-center my-8">
        <PreviewImage
          triggerNode={
            <Image
              src={currentArticle.cover || PLACEHOLDER_COVER}
              alt={currentArticle.title}
              width="0"
              height="0"
              sizes="100vw"
              className={cn(
                'h-auto rounded cursor-pointer',
                'w-full 2xl:w-3/4',
              )}
            />
          }
          imageUrl={currentArticle.cover || PLACEHOLDER_COVER}
        />
      </div>

      <div className={cn('flex items-start space-x-8', 'flex-col lg:flex-row')}>
        <div
          className={cn(
            'flex flex-col space-y-4 divide-y w-full',
            'lg:w-[200px] lg:sticky lg:top-[136px]',
          )}
        >
          <div className="">
            <div className="font-semibold text-gray-500 mb-4">标签</div>
            <div className="flex flex-wrap">
              {currentArticle.tags?.map((tag) => (
                <Link
                  key={tag.id}
                  className="mr-4 mb-2 text-sm font-medium text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                  href={`/tags/${tag.friendlyUrl}`}
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="pt-4">
            <div className="font-semibold text-gray-500 mb-4">最后更新时间</div>
            <div className="text-sm leading-6 tracking-wider text-gray-500">
              {formatToDateTime(currentArticle.updatedAt)}
            </div>
          </div>
          <div className={cn('text-base leading-6', 'hidden lg:block lg:pt-4')}>
            <Link
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              href={`/articles`}
            >
              ← 返回文章列表
            </Link>
          </div>
        </div>
        <div className="flex-1">
          <BytemdViewer content={currentArticle.content} />
        </div>
      </div>
    </div>
  );
}
