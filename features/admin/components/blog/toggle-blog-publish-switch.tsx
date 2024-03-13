'use client';

import { Switch } from '@/components/ui/switch';

import { useToggleBlogPublish } from '@/features/blog';

type ToggleBlogPublishSwitchProps = {
  id: string;
};

export const ToggleBlogPublishSwitch = ({
  id,
}: ToggleBlogPublishSwitchProps) => {
  const toggleBlogPublishQuery = useToggleBlogPublish();

  return <Switch checked={true} onCheckedChange={handleCheckedChange} />;

  async function handleCheckedChange() {
    await toggleBlogPublishQuery.mutateAsync(id);
  }
};
