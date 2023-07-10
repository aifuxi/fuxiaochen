'use client';

import React from 'react';

import { Toaster } from '../ui/toaster';

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
};
