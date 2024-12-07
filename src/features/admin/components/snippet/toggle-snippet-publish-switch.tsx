"use client";

import { Switch } from "@/components/ui/switch";

import { useToggleSnippetPublish } from "@/features/snippet";

type ToggleSnippetPublishSwitchProps = {
  id: string;
  published: boolean;
  refreshAsync: () => Promise<unknown>;
};

export const ToggleSnippetPublishSwitch = ({
  id,
  published,
  refreshAsync,
}: ToggleSnippetPublishSwitchProps) => {
  const toggleSnippetPublishQuery = useToggleSnippetPublish();

  return <Switch checked={published} onCheckedChange={handleCheckedChange} />;

  async function handleCheckedChange() {
    await toggleSnippetPublishQuery.runAsync(id);
    await refreshAsync();
  }
};
