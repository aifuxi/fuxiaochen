import React from 'react';

import { AdminLayout } from '@/features/admin';

export default function Layout({ children }: React.PropsWithChildren) {
  return <AdminLayout>{children}</AdminLayout>;
}
