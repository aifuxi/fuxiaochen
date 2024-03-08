import { type Metadata } from 'next';

import { AdminHomePage } from '@/features/admin';

export const metadata: Metadata = {
  title: '首页',
};

export default function Page() {
  return <AdminHomePage />;
}
