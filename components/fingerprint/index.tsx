'use client';

import { usePathname } from 'next/navigation';

import { useAsyncEffect } from 'ahooks';

import { useRecordPV, useRecordUV } from '@/features/statistics';
import { useCuid } from '@/hooks';
import { createCuid } from '@/lib/cuid';
import { sleep } from '@/utils';

export const Fingerprint = () => {
  const { cuid, setCuid } = useCuid();
  const pathname = usePathname();
  const pvRecordQuery = useRecordPV();
  const uvRecordQuery = useRecordUV();

  useAsyncEffect(async () => {
    let id = cuid;

    if (!id) {
      // 生成 cuid 然后上传埋点
      id = createCuid();
      setCuid(id);
    }

    // 3s 后才开始上报
    await sleep(3 * 1000);

    await pvRecordQuery.runAsync();
    await uvRecordQuery.runAsync(id);
  }, [pathname]);

  return null;
};
