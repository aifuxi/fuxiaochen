"use client";

import { Switch } from "@/components/ui/switch";

import { useToggleBlogPublish } from "@/features/blog";

type ToggleBlogPublishSwitchProps = {
  id: string;
  published: boolean;
  refreshAsync: () => Promise<unknown>;
};

export const ToggleBlogPublishSwitch = ({
  id,
  published,
  refreshAsync,
}: ToggleBlogPublishSwitchProps) => {
  const toggleBlogPublishQuery = useToggleBlogPublish();

  return <Switch checked={published} onCheckedChange={handleCheckedChange} />;

  async function handleCheckedChange() {
    await toggleBlogPublishQuery.runAsync(id);
    await refreshAsync();
  }
};
