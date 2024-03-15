'use client';

import React from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { NODE_ENV } from '@/config';

import { queryClient } from '@/lib/react-query';

export const ReactQueryProvider = ({ children }: React.PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
        />
      )}
    </QueryClientProvider>
  );
};
