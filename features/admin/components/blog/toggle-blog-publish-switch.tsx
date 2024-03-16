'use client';

import { Switch } from '@/components/ui/switch';

import { useToggleBlogPublish } from '@/features/blog';

type ToggleBlogPublishSwitchProps = {
  id: string;
  published: boolean;
};

export const ToggleBlogPublishSwitch = ({
  id,
  published,
}: ToggleBlogPublishSwitchProps) => {
  const toggleBlogPublishQuery = useToggleBlogPublish();

  return <Switch checked={published} onCheckedChange={handleCheckedChange} />;

  async function handleCheckedChange() {
    await toggleBlogPublishQuery.mutateAsync(id);
  }
};
