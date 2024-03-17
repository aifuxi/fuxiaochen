'use client';

import { Switch } from '@/components/ui/switch';

import { useToggleSnippetPublish } from '@/features/snippet';

type ToggleSnippetPublishSwitchProps = {
  id: string;
  published: boolean;
};

export const ToggleSnippetPublishSwitch = ({
  id,
  published,
}: ToggleSnippetPublishSwitchProps) => {
  const toggleSnippetPublishQuery = useToggleSnippetPublish();

  return <Switch checked={published} onCheckedChange={handleCheckedChange} />;

  async function handleCheckedChange() {
    await toggleSnippetPublishQuery.mutateAsync(id);
  }
};
