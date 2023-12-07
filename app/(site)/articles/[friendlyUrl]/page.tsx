import { type Metadata } from 'next';
import Link from 'next/link';

import { getArticleByFriendlyURL } from '@/app/actions/article';
import { BytemdViewer } from '@/components/bytemd';
import { badgeVariants } from '@/components/ui/badge';
import { PATHS } from '@/constants/path';
import { PLACEHOLDER_COVER } from '@/constants/unknown';
import { cn } from '@/utils/helper';

export async function generateMetadata({
  params,
}: {
  params: { friendlyUrl: string };
}): Promise<Metadata> {
  const article = await getArticleByFriendlyURL(params.friendlyUrl);
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
  const article = await getArticleByFriendlyURL(params.friendlyUrl);

  return (
    <div className="flex flex-col gap-8 items-center">
      <img
        className="w-[1500px] h-[500px] object-fill"
        src={article?.cover ?? PLACEHOLDER_COVER}
        alt={article?.title}
      />

      <div className="flex flex-col gap-8 pb-9">
        <div className="container mx-auto">
          <BytemdViewer content={article?.content ?? ''} />

          <div className="flex items-center flex-wrap  gap-4">
            <p className="text-xl text-muted-foreground">标签：</p>
            {article?.tags?.map((tag) => (
              <Link
                href={`${PATHS.SITE_TAGS}/${tag.friendlyUrl}`}
                key={tag.id}
                className={cn(
                  badgeVariants({ variant: 'default' }),
                  'text-md px-4 py-2 !rounded-none',
                )}
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
