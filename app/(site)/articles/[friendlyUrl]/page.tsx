import { type Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { isNil } from 'lodash-es';

import BackToPreviousPage from './back-to-previous-page';
import EditArticle from './edit-article';
import EmptyArticle from './empty-article';
import { getArticleByFriendlyURLAction } from '@/app/_actions/article';
import { BytemdViewer } from '@/components/client';
import { PageTitle } from '@/components/rsc';
import { PLACEHOLDER_COVER } from '@/constants';
import { cn, formatToDate } from '@/utils';

export async function generateMetadata({
  params,
}: {
  params: { friendlyUrl: string };
}): Promise<Metadata> {
  const article = await getArticleByFriendlyURLAction(params.friendlyUrl);
  const title = article?.title ?? '文章未找到';
  return {
    title,
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: { friendlyUrl: string };
}) {
  const article = await getArticleByFriendlyURLAction(params.friendlyUrl);

  if (isNil(article)) {
    return <EmptyArticle />;
  }

  return (
    <div className=" flex flex-col space-y-8">
      <div className="flex justify-center">
        <Image
          src={article.cover ?? PLACEHOLDER_COVER}
          alt={article.title}
          width="0"
          height="0"
          sizes="100vw"
          className={cn('h-auto', 'w-full')}
        />
      </div>
      <div className="container flex flex-col space-y-8">
        <div className="text-center text-base font-medium leading-6 tracking-wider text-primary/50">
          {formatToDate(article.createdAt)}
        </div>
        <PageTitle
          title={article.title}
          className="text-center pt-0 !leading-[1.2em]"
        />

        <div
          className={cn(
            'flex items-start',
            'flex-col lg:flex-row justify-between',
          )}
        >
          <div
            className={cn(
              'flex flex-col space-y-4 divide-y w-full',
              'lg:w-[200px] lg:min-w-[200px] lg:sticky lg:top-[136px] lg:mr-8',
            )}
          >
            <div className="">
              <div className="font-semibold text-primary/50 mb-4">标签</div>
              <div className="flex flex-wrap">
                {article?.tags?.map((tag) => (
                  <Link
                    key={tag.id}
                    className="mr-4 mb-2 text-sm font-medium transition-colors text-primary/75 hover:text-primary"
                    href={`/tags/${tag.friendlyUrl}`}
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="pt-4">
              <div className="font-semibold text-primary/50 mb-4">
                最近更新时间
              </div>
              <div className="text-sm leading-6 tracking-wider text-primary/50">
                {formatToDate(article.updatedAt)}
              </div>
            </div>
            <div
              className={cn(
                'text-base leading-6',
                'hidden lg:flex lg:items-center lg:pt-4 transition-colors text-primary/75 hover:text-primary',
              )}
            >
              <BackToPreviousPage />
              <EditArticle articleId={article.id} />
            </div>
          </div>
          <div className="max-w-[100%] lg:max-w-[calc(100%-232px)] flex-1">
            <BytemdViewer content={article.content} />
          </div>
        </div>
      </div>
    </div>
  );
}
