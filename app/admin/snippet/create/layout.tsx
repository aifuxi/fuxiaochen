import React from 'react';

import { type Metadata } from 'next';

import { PATHS, PATHS_MAP } from '@/constants';
import { getAdminPageTitle } from '@/utils';

export const metadata: Metadata = {
  title: getAdminPageTitle(PATHS_MAP[PATHS.ADMIN_SNIPPET_CREATE]),
};

export default function Layout({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}
