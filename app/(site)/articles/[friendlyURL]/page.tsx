import { type Metadata } from 'next';
import Link from 'next/link';

import { getArticleByFriendlyURL } from '@/app/actions/article';

import { badgeVariants } from '@/components/ui/badge';

import { BytemdViewer } from '@/components/bytemd';

import { cn } from '@/utils/helper';

import { PATHS } from '@/constants/path';
import { PLACEHOLDER_COVER } from '@/constants/unknown';

export async function generateMetadata({
  params,
}: {
  params: { friendlyURL: string };
}): Promise<Metadata> {
  const article = await getArticleByFriendlyURL(params.friendlyURL);
  const title = article?.title ?? '文章未找到';
  return {
    title,
  };
}

export const revalidate = 60;

export default async function ArticleDetailPage({
  params,
}: {
  params: { friendlyURL: string };
}) {
  const article = await getArticleByFriendlyURL(params.friendlyURL);

  return (
    <div className="flex flex-col gap-8 items-center pt-8">
      <img
        className="max-w-[calc(100vw-2rem)] object-fill border"
        src={article?.cover ?? PLACEHOLDER_COVER}
        alt={article?.title}
      />

      <div className="container flex flex-col gap-8 pb-9">
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
      </div>
    </div>
  );
}
