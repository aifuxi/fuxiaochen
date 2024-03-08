'use client';

import React from 'react';
import { HashLoader } from 'react-spinners';

import { useTheme } from 'next-themes';

type LoadingSpinnerProps = {
  loading: boolean;
};

export const LoadingSpinner = ({ loading }: LoadingSpinnerProps) => {
  const { resolvedTheme } = useTheme();

  return loading ? (
    <div className="absolute -inset-1 z-10 bg-background/80 grid place-content-center">
      <HashLoader
        color={resolvedTheme === 'dark' ? 'white' : 'black'}
        loading
      />
    </div>
  ) : null;
};
