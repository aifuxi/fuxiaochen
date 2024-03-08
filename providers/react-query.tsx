'use client';

import React from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { type FCProps } from '@/types';

import { queryClient } from '@/lib/react-query';

export const ReactQueryProvider = ({ children }: FCProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="top-left" />
      )}
    </QueryClientProvider>
  );
};
