"use client";

import { Switch } from "@/components/ui/switch";

import { useToggleBlogPublish } from "../api";

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
  const { trigger, isMutating } = useToggleBlogPublish(id);

  return (
    <Switch
      disabled={isMutating}
      defaultChecked={published}
      onCheckedChange={handleCheckedChange}
    />
  );

  async function handleCheckedChange() {
    await trigger();
    onSuccess?.();
  }
};
