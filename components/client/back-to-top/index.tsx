'use client';

import React from 'react';

import { ThickArrowUpIcon } from '@radix-ui/react-icons';
import { IconButton } from '@radix-ui/themes';
import { useBoolean, useMemoizedFn, useMount, useUnmount } from 'ahooks';

import { cn } from '@/utils';

export function BackToTop() {
  const [visible, { setFalse, setTrue }] = useBoolean(false);

  const handleScroll = useMemoizedFn(() => {
    if (window.document.documentElement.scrollTop > 100) {
      setTrue();
    } else {
      setFalse();
    }
  });

  useMount(() => {
    window.document.addEventListener('scroll', handleScroll);
  });

  useUnmount(() => {
    window.document.removeEventListener('scroll', handleScroll);
  });

  return (
    <IconButton
      variant="solid"
      className={cn('fixed bottom-10 right-10', !visible && 'hidden')}
      color="gray"
      highContrast
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    >
      <ThickArrowUpIcon />
    </IconButton>
  );
}
