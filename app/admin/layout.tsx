import { type FCProps } from '@/types';

import { AdminLayout } from '@/features/admin';

export default function Layout({ children }: FCProps) {
  return <AdminLayout>{children}</AdminLayout>;
}
