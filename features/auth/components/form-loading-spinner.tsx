'use client';

import React from 'react';
import { HashLoader } from 'react-spinners';

import { useTheme } from 'next-themes';

type FormLoadingSpinnerProps = {
  loading: boolean;
};

export const FormLoadingSpinner = ({ loading }: FormLoadingSpinnerProps) => {
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
