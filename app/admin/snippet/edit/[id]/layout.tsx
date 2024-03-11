import * as React from 'react';

import { type Metadata } from 'next';

import { type FCProps } from '@/types';

export const metadata: Metadata = {
  title: '编辑Snippet',
};

export default function Layout({ children }: FCProps) {
  return <>{children}</>;
}
