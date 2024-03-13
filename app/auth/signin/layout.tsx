import React from 'react';

import { type Metadata } from 'next';

import { PATHS, PATHS_MAP } from '@/config';

export const metadata: Metadata = {
  title: PATHS_MAP[PATHS.AUTH_SIGNIN],
};

export default function Layout({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}
