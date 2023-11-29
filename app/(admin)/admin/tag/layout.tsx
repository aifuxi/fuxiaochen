import React from 'react';

import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: '标签管理',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
