'use client';

import { Switch } from '@/components/ui/switch';

import { useToggleSnippetPublish } from '@/features/snippet';

type ToggleSnippetPublishSwitchProps = {
  id: string;
  published: boolean;
  refresh: () => void;
};

export const ToggleSnippetPublishSwitch = ({
  id,
  published,
  refresh,
}: ToggleSnippetPublishSwitchProps) => {
  const toggleSnippetPublishQuery = useToggleSnippetPublish();

  return <Switch checked={published} onCheckedChange={handleCheckedChange} />;

  function handleCheckedChange() {
    toggleSnippetPublishQuery.run(id);
    refresh();
  }
};
