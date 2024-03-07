import * as React from 'react';

import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: '编辑文章',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
