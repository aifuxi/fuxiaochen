'use client';

import React from 'react';

import { useBoolean, useScroll } from 'ahooks';

import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

import { IconSolarSquareAltArrowUp } from '../icons';

type BackToTopProps = {
  scrollRef?: React.MutableRefObject<HTMLDivElement | null>;
};

export const BackToTop = ({ scrollRef: scrollElement }: BackToTopProps) => {
  const [visible, { setFalse, setTrue }] = useBoolean(false);

  const target = scrollElement?.current ?? document.documentElement;
  const scroll = useScroll(scrollElement?.current ?? document.documentElement);

  React.useEffect(() => {
    if ((scroll?.top ?? 0) > 100) {
      setTrue();
    } else {
      setFalse();
    }
  }, [scroll, setFalse, setTrue]);

  return (
    <Button
      className={cn('fixed bottom-8 right-8', !visible && 'hidden')}
      size={'icon'}
      onClick={() => {
        target.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    >
      <IconSolarSquareAltArrowUp className="text-2xl" />
    </Button>
  );
};
