import * as React from 'react';

import { type Metadata } from 'next';

import { PATHS, PATHS_MAP } from '@/config';

import { type FCProps } from '@/types';

import { getAdminPageTitle } from '@/utils';

export const metadata: Metadata = {
  title: getAdminPageTitle(PATHS_MAP[PATHS.ADMIN_SNIPPET_EDIT]),
};

export default function Layout({ children }: FCProps) {
  return <>{children}</>;
}
