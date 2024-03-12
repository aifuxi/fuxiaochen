import { type Metadata } from 'next';

import { PATHS, PATHS_MAP } from '@/config';

import { type FCProps } from '@/types';

export const metadata: Metadata = {
  title: PATHS_MAP[PATHS.AUTH_SIGNUP],
};

export default function Layout({ children }: FCProps) {
  return <>{children}</>;
}
