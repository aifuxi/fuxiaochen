'use client';

import { useMount } from 'ahooks';

import { useCuid } from '@/hooks';
import { createCuid } from '@/lib/cuid';

export const Fingerprint = () => {
  const { cuid, setCuid } = useCuid();

  useMount(() => {
    if (cuid) {
      // TODO: 上传埋点
    } else {
      // 生成 cuid 然后上传埋点
      const id = createCuid();
      setCuid(id);
    }
  });

  return null;
};
