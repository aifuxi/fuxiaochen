import { IllustrationNoContent } from '@/components/illustrations';

import { ArticleListItem } from './article-list-item';

import { type Article } from '../types';

type ArticleListProps = {
  articles: Article[];
};

export const ArticleList = ({ articles }: ArticleListProps) => {
  if (!articles.length) {
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
    <ul className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
      {articles.map((el) => (
        <li key={el.id}>
          <ArticleListItem article={el} />
        </li>
      ))}
    </ul>
  );
};
