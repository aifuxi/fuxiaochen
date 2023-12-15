import { type Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getUnixTime } from 'date-fns';
import { isNil } from 'lodash-es';

import { getArticleByFriendlyURL } from '@/app/actions/article';

import { badgeVariants } from '@/components/ui/badge';

import { BytemdViewer } from '@/components/bytemd';

import { cn } from '@/utils/helper';
import { formatToDate, formatToDateTime } from '@/utils/time';

import { PATHS } from '@/constants/path';
import { PLACEHOLDER_COVER } from '@/constants/unknown';

export async function generateMetadata({
  params,
}: {
  params: { friendlyURL: string };
}): Promise<Metadata> {
  const article = await getArticleByFriendlyURL(params.friendlyURL);
  return {
    title: article?.title,
    description: article?.description,
    keywords: article?.tags?.map((el) => el.name).join(','),
  };
}

export const revalidate = 60;

export default async function ArticleDetailPage({
  params,
}: {
  params: { friendlyURL: string };
}) {
  const article = await getArticleByFriendlyURL(params.friendlyURL);

  if (isNil(article)) {
    return notFound();
  }

  const noUpdate =
    getUnixTime(article.createdAt) === getUnixTime(article.updatedAt);

  return (
    <div className="flex flex-col gap-8 items-center pt-8">
      <img
        className="max-w-[calc(100vw-2rem)] object-fill border"
        src={article?.cover ?? PLACEHOLDER_COVER}
        alt={article?.title}
      />

      <div className="container flex flex-col gap-8 pb-9">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          {article?.title}
        </h1>

        <BytemdViewer content={article?.content ?? ''} />

        <div className="flex items-center flex-wrap gap-4 pt-8">
          <p className="sm:text-xl text-muted-foreground">标签：</p>
          {article?.tags?.map((tag) => (
            <Link
              href={`${PATHS.SITE_TAGS}/${tag.friendlyURL}`}
              key={tag.id}
              className={cn(
                badgeVariants({ variant: 'default' }),
                'sm:text-md sm:px-4 sm:py-2 !rounded-none',
              )}
            >
              {tag.name}
            </Link>
          ))}
        </div>

        <p className="text-muted-foreground">
          发布于
          <span className="font-semibold mx-1">
            {formatToDate(article.createdAt)}
          </span>
          {!noUpdate && (
            <>
              ，最后更新时间
              <span className="font-semibold mx-1">
                {formatToDateTime(article.updatedAt)}
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
