import { type Metadata } from 'next';

import { PATHS, PATHS_MAP } from '@/config';

import { type FCProps } from '@/types';

import { getAdminPageTitle } from '@/utils';

export const metadata: Metadata = {
  title: getAdminPageTitle(PATHS_MAP[PATHS.ADMIN_ARTICLE_CREATE]),
};

export default function Layout({ children }: FCProps) {
  return <>{children}</>;
}
