'use client';

import React from 'react';

import { useScroll } from 'ahooks';

import { ScrollArea } from '@/components/ui/scroll-area';

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
    <div ref={scrollRef} className="w-full flex flex-col space-y-4 relative">
      <div
        className={cn(
          'sticky top-0 bg-background p-12 pb-2 backdrop-blur-lg transition-[background-color,border-width]',
          (scroll?.top ?? 0) > 60 &&
            'bg-background/90 border-b border-border/50',
        )}
      >
        {pageHeader}
      </div>
      <ScrollArea className="lg:px-12 animate-fade h-[calc(100vh-174px)]">
        {children}
      </ScrollArea>

      <BackToTop scrollRef={scrollRef} />
    </div>
  );
};
