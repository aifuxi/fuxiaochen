'use client';

import React from 'react';

import { useTheme } from 'next-themes';

import { useFavicon } from 'ahooks';

import { DARK_FAVICON_URL, LIGHT_FAVICON_URL } from '@/constants';

export const Favicon = () => {
  const { resolvedTheme } = useTheme();
  const [url, setUrl] = React.useState<string>(DARK_FAVICON_URL);
  useFavicon(url);

  React.useEffect(() => {
    // 根据主题动态切换favicon
    if (resolvedTheme === 'dark') {
      // 黑暗模式下的 favicon
      setUrl(LIGHT_FAVICON_URL);
    } else {
      // 其它时候的 favicon
      setUrl(DARK_FAVICON_URL);
    }
  }, [resolvedTheme]);

  return null;
};
