"use client";

import { Switch } from "@/components/ui/switch";

import { useToggleBlogPublish } from "@/features/blog";

interface ToggleBlogPublishSwitchProps {
  id: string;
  published: boolean;
  onSuccess?: () => void;
}

export const ToggleBlogPublishSwitch = ({
  id,
  published,
  onSuccess,
}: ToggleBlogPublishSwitchProps) => {
  const mutation = useToggleBlogPublish(id);

  return <Switch checked={published} onCheckedChange={handleCheckedChange} />;

  async function handleCheckedChange() {
    mutation.trigger();
    onSuccess?.();
  }
};
