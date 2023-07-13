'use client';

import React, { useState } from 'react';

import Giscus from '@giscus/react';
import { useMount, useMutationObserver } from 'ahooks';

export default function GiscusComment() {
  const [theme, setTheme] = useState<'dark' | 'light'>();

  useMount(() => {
    if (
      localStorage.getItem('color-theme') === 'dark' ||
      (!('color-theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  });

  useMutationObserver(
    (mutationsList) => {
      mutationsList.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          if (window.document.documentElement.classList.contains('dark')) {
            setTheme('dark');
          } else {
            setTheme('light');
          }
        }
      });
    },
    window.document.documentElement,
    { attributes: true, attributeFilter: ['class'] },
  );

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
