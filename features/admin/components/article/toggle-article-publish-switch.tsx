'use client';

import { Switch } from '@/components/ui/switch';

import { useToggleArticlePublish } from '@/features/article';

type ToggleArticlePublishSwitchProps = {
  id: string;
};

export const ToggleArticlePublishSwitch = ({
  id,
}: ToggleArticlePublishSwitchProps) => {
  const toggleArticlePublishQuery = useToggleArticlePublish();

  return <Switch checked={true} onCheckedChange={handleCheckedChange} />;

  async function handleCheckedChange() {
    await toggleArticlePublishQuery.mutateAsync(id);
  }
};
