'use client';

import { useEffect } from 'react';

import { useTheme } from 'next-themes';

import { isBrowser } from '@/lib/utils';

export const Favicon = () => {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // 针对 SSR 场景适配
    if (isBrowser()) {
      // 获取声明中含 rel="icon" 的元素
      const favicon: HTMLLinkElement | null =
        document.querySelector('link[rel="icon"]');
      if (!favicon) {
        return;
      }

      // 根据主题动态切换favicon
      if (resolvedTheme === 'dark') {
        //黑暗模式下的 favicon
        favicon.href = '/images/fuxiaochen-light.svg';
      } else {
        //其它时候的 favicon
        favicon.href = '/images/fuxiaochen-dark.svg';
      }
    }
  }, [resolvedTheme]);

  return null;
};
