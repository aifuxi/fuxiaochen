import { NICKNAME } from '@/config';

import { Badge } from '@/components/ui/badge';

import { BytemdViewer } from '@/components/bytemd';
import { GoBack } from '@/components/go-back';

import { toSimpleDateString } from '@/lib/utils';

import { type Article } from '../types';

type ArticleDetailProps = {
  article: Article;
};

export const ArticleDetailPage = ({ article }: ArticleDetailProps) => {
  return (
    <div className="max-w-[65ch] mx-auto py-24 grid gap-9">
      <article>
        {article.cover && (
          <img
            src={article.cover}
            alt={article.title}
            className="max-w-[65ch] h-auto mb-16"
          />
        )}
        <h1 className="mb-4 text-4xl font-extrabold ">{article.title}</h1>
        <div className="text-sm flex flex-row items-center text-muted-foreground">
          <div>{NICKNAME}</div>
          <span className="mx-2">·</span>
          <span>{toSimpleDateString(article.createdAt)}</span>
        </div>
        <BytemdViewer body={article.body || ''} />
      </article>

      <div className="flex space-x-2">
        {article.tags?.map((el) => (
          <Badge key={el.id} className="px-5 py-2 text-base">
            {el.name}
          </Badge>
        ))}
      </div>
      <GoBack />
    </div>
  );
};
