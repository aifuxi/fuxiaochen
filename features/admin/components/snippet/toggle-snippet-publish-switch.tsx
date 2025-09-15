"use client";

import { Switch } from "@/components/ui/switch";

import { useToggleSnippetPublish } from "@/features/snippet";

interface ToggleSnippetPublishSwitchProps {
  id: string;
  published: boolean;
  onSuccess?: () => void;
}

export const ToggleSnippetPublishSwitch = ({
  id,
  published,
  onSuccess,
}: ToggleSnippetPublishSwitchProps) => {
  const mutation = useToggleSnippetPublish(id);

  return <Switch checked={published} onCheckedChange={handleCheckedChange} />;

  async function handleCheckedChange() {
    mutation.trigger();
    onSuccess?.();
  }
};
