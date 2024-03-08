import { type Metadata } from 'next';

import { type FCProps } from '@/types';

export const metadata: Metadata = {
  title: '标签列表',
};

export default function Layout({ children }: FCProps) {
  return <>{children}</>;
}
