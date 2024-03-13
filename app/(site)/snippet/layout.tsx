import React from 'react';

import { type Metadata } from 'next';

import { PATHS, PATHS_MAP } from '@/config';

export const metadata: Metadata = {
  title: PATHS_MAP[PATHS.SITE_SNIPPET],
};

export default function Layout({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}
