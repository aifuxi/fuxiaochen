import { type Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { format } from 'date-fns';

import { Badge } from '@/components/ui/badge';

import { IllustrationNoContent } from '@/components/illustrations';

import { NICKNAME, PATHS } from '@/config';

import { getPublishedArticles } from '../../actions/article';

export const metadata: Metadata = {
  title: '文章',
};
export const revalidate = 60;

export default async function ArticlesPage() {
  const { articles } = await getPublishedArticles();

  return (
    <div className="w-full flex flex-col justify-center max-w-screen-md gap-5">
      <h2 className="text-4xl md:text-5xl leading-[1.125] font-bold tracking-tight">
        文章
      </h2>
      {renderArticleList()}
    </div>
  );

  function renderArticleList() {
    if (!articles?.length) {
      return (
        <div className="grid gap-8 place-content-center">
          <IllustrationNoContent className="w-[30vh] h-[30vh]" />
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center">
            暂无文章
          </h3>
        </div>
      );
    }

    return (
      <div>
        <div className="gap-4 flex flex-col">
          {articles.map((el) => (
            <Link
              key={el.id}
              href={`${PATHS.SITE_ARTICLES}/${el.slug}`}
              className="rounded-2xl border shadow-sm flex items-center p-6 hover:bg-accent transition-all"
            >
              <div className="flex-1 flex flex-col">
                <div className="flex flex-col space-y-1.5">
                  <h3 className="text-2xl font-semibold leading-none tracking-tight">
                    {el.title}
                  </h3>
                  <p className="text-sm pt-2 text-muted-foreground">
                    {el.description}
                  </p>
                </div>
                <div className="flex flex-col gap-y-4 pt-6">
                  <div className="text-sm flex">
                    <div className="flex-1 text-muted-foreground">
                      {NICKNAME}&nbsp;·&nbsp;
                      {format(el.createdAt, 'MMMM dd, yyyy')}
                    </div>
                  </div>
                  <div className="flex flex-row gap-2">
                    {el.tags?.map((tag) => (
                      <Badge key={tag.id}>{tag.name}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              {el.cover && (
                <Image
                  src={el.cover}
                  width={110}
                  height={74}
                  className="ml-6"
                  alt={el.title}
                />
              )}
            </Link>
          ))}
        </div>
      </div>
    );
  }
}
