import { type Metadata } from 'next';

import { PATHS, PATHS_MAP } from '@/config';

import { type FCProps } from '@/types';

export const metadata: Metadata = {
  title: PATHS_MAP[PATHS.SITE_BLOG],
};

export default function Layout({ children }: FCProps) {
  return <>{children}</>;
}
