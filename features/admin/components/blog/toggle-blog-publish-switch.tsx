'use client';

import { Switch } from '@/components/ui/switch';

import { useToggleBlogPublish } from '@/features/blog';

type ToggleBlogPublishSwitchProps = {
  id: string;
  published: boolean;
  refresh: () => void;
};

export const ToggleBlogPublishSwitch = ({
  id,
  published,
  refresh,
}: ToggleBlogPublishSwitchProps) => {
  const toggleBlogPublishQuery = useToggleBlogPublish();

  return <Switch checked={published} onCheckedChange={handleCheckedChange} />;

  function handleCheckedChange() {
    toggleBlogPublishQuery.run(id);
    refresh();
  }
};
