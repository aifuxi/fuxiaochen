'use client';

import { useAsyncEffect } from 'ahooks';

import { useRecordBlogUV } from '@/features/statistics';
import { useCuid } from '@/hooks';
import { sleep } from '@/utils';

export const BlogEventTracking = ({ blogID }: { blogID: string }) => {
  const recordBlogUVQuery = useRecordBlogUV();
  const { cuid } = useCuid();

  useAsyncEffect(async () => {
    await sleep(3 * 1000);
    await recordBlogUVQuery.runAsync(blogID, cuid);
  }, [blogID, cuid]);

  return null;
};
