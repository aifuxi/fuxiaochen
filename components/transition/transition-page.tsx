'use client';

import React from 'react';

import { usePathname } from 'next/navigation';

import { AnimatePresence } from 'framer-motion';

import { TransitionCurve } from './transition-curve';

export const PageTransition = ({ children }: React.PropsWithChildren) => {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      {typeof window !== 'undefined' && (
        <TransitionCurve key={pathname}>{children}</TransitionCurve>
      )}
    </AnimatePresence>
  );
};
