'use client';

import { type Article } from '@prisma/client';

import { toggleArticlePublish } from '@/app/actions/article';

import { Switch } from '@/components/ui/switch';

type Props = {
  article: Article;
};

export function TogglePublishSwitch({ article }: Props) {
  return (
    <Switch
      checked={article.published}
      onCheckedChange={async () => {
        await toggleArticlePublish(article.id);
      }}
    />
  );
}
