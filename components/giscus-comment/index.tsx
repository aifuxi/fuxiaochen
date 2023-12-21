'use client';

import { useTheme } from 'next-themes';

import Giscus from '@giscus/react';

export function GiscusComment() {
  const { theme } = useTheme();

  return (
    <Giscus
      id="giscus-comments"
      repo="aifuxi/aifuxi.cool"
      repoId="R_kgDOJ3P-jQ"
      category="Announcements"
      categoryId="DIC_kwDOJ3P-jc4CX26h"
      mapping="url"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={theme}
      lang="zh-CN"
      loading="lazy"
    />
  );
}
