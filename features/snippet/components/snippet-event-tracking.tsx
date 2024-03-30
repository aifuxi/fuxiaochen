'use client';

import { useAsyncEffect } from 'ahooks';

import { useRecordSnippetUV } from '@/features/statistics';
import { useCuid } from '@/hooks';
import { sleep } from '@/utils';

export const SnippetEventTracking = ({ snippetID }: { snippetID: string }) => {
  const recordSnippetUVQuery = useRecordSnippetUV();
  const { cuid } = useCuid();

  useAsyncEffect(async () => {
    await sleep(3 * 1000);
    await recordSnippetUVQuery.runAsync(snippetID, cuid);
  }, [snippetID, cuid]);

  return null;
};
