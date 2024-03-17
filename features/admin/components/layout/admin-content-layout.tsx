'use client';

import React from 'react';

import { useScroll } from 'ahooks';

import { BackToTop } from '@/components/back-to-top';

import { cn } from '@/lib/utils';

type AdminContentLayoutProps = {
  pageHeader?: React.ReactNode;
} & React.PropsWithChildren;

export const AdminContentLayout = ({
  children,
  pageHeader,
}: AdminContentLayoutProps) => {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const scroll = useScroll(scrollRef);

  return (
    <div
      ref={scrollRef}
      className="w-full max-h-screen h-screen overflow-y-auto flex flex-col space-y-4 relative"
    >
      <div
        className={cn(
          'sticky top-0 bg-background p-12 pb-2 backdrop-blur-lg transition-[background-color,border-width] z-50',
          (scroll?.top ?? 0) > 60 &&
            'bg-background/90 border-b border-border/50',
        )}
      >
        {pageHeader}
      </div>
      <div className="px-12 flex flex-col space-y-4 animate-fade">
        {children}
      </div>

      <BackToTop scrollRef={scrollRef} />
    </div>
  );
};
