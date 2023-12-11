import Link from 'next/link';

import { type Article, type Tag } from '@prisma/client';
import { MoveRightIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PATHS } from '@/constants/path';
import { PLACEHOLDER_COVER } from '@/constants/unknown';
import { cn, formatToDate } from '@/utils';

type Props = {
  article: Article & { tags?: Tag[] };
};

export default function ArticleItem({ article }: Props) {
  return (
    <Link
      href={`${PATHS.SITE_ARTICLES}/${article.friendlyURL}`}
      className={cn(
        'relative flex flex-col space-y-2 border-b p-4  md:p-8',
        'md:flex-row md:space-x-6 md:space-y-0',
        `after:absolute after:inset-0 after:w-0  after:z-[-1] after:hover:bg-foreground/5 after:hover:w-full after:transition-all after:duration-700`,
      )}
    >
      <img
        src={article.cover ? article.cover : PLACEHOLDER_COVER}
        alt={article.title}
        className="w-[300px]"
      />
      <div className="flex flex-col gap-3 flex-1">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          {article.title}
        </h4>

        <div className="flex flex-wrap gap-4">
          {article.tags?.map((tag) => (
            <Badge key={tag.id} className="!rounded-none">
              {tag.name}
            </Badge>
          ))}
        </div>

        <p className="leading-7 [&:not(:first-child)]:mt-6 line-clamp-2 sm:line-clamp-4">
          {article.description}
        </p>

        <div className="flex flex-col justify-end flex-1">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {formatToDate(new Date(article.createdAt))}
            </p>

            <Button>
              阅读更多
              <MoveRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
