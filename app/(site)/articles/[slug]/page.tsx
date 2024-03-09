import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import { isNil } from 'lodash-es';

import { getArticleBySlug } from '@/app/actions/article';

import { NICKNAME } from '@/config';

import { Badge } from '@/components/ui/badge';

import { BytemdViewer } from '@/components/bytemd';
import { GoBack } from '@/components/go-back';

import { formatDateDetail } from '@/lib/util';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    return {};
  }

  return {
    title: article.title,
    description: article.description,
    keywords: article?.tags?.map((el) => el.name).join(','),
  };
}

export const revalidate = 60;

export default async function ArticleDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticleBySlug(params.slug);

  if (isNil(article)) {
    return notFound();
  }

  return (
    <div className="flex flex-col gap-y-4">
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
          <span>{formatDateDetail(article.createdAt)}</span>
        </div>
        <BytemdViewer content={article.content || ''} />
      </article>

      <div className="flex flex-row gap-2">
        {article.tags?.map((el) => <Badge key={el.id}>{el.name}</Badge>)}
      </div>
      <GoBack />
    </div>
  );
}
