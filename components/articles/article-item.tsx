import Image from 'next/image';
import Link from 'next/link';

import { type Article, type Tag } from '@prisma/client';

import { Badge } from '@/components/ui/badge';

import { cn } from '@/utils/helper';
import { formatToDate } from '@/utils/time';

import { PATHS } from '@/constants/path';
import { PLACEHOLDER_COVER } from '@/constants/unknown';

type Props = {
  article: Article & { tags?: Tag[] };
};

export function ArticleItem({ article }: Props) {
  return (
    <Link
      href={`${PATHS.SITE_ARTICLES}/${article.slug}`}
      className={cn('flex py-3 px-5 bg-background hover:bg-accent rounded-2xl')}
    >
      <div className="flex flex-col flex-1 text-xs space-y-1">
        <h4 className="text-base font-semibold line-clamp-1">
          {article.title}
        </h4>

        <p className="line-clamp-1">{article.description}</p>

        <div className="flex justify-between">
          <div>
            <span>{formatToDate(new Date(article.createdAt))}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {article.tags?.map((tag) => <Badge key={tag.id}>{tag.name}</Badge>)}
          </div>
        </div>
      </div>
      <Image
        src={article.cover ? article.cover : PLACEHOLDER_COVER}
        alt={article.title}
        width={110}
        height={74}
        className="ml-6 border rounded-lg"
      />
    </Link>
  );
}
