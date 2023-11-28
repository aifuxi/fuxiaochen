'use client';

import { type Article } from '@prisma/client';
import { Switch } from '@radix-ui/themes';

import { toggleArticlePublish } from '@/app/_actions/article';

type Props = {
  article: Article;
};

export function TogglePublishSwitch({ article }: Props) {
  return (
    <Switch
      checked={article.published}
      color="gray"
      highContrast
      onCheckedChange={async () => {
        await toggleArticlePublish(article.id);
      }}
    />
  );
}
