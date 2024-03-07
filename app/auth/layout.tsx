import { type FCProps } from '@/types';

import { AuthLayout } from '@/features/auth';

export default function Layout({ children }: FCProps) {
  return <AuthLayout>{children}</AuthLayout>;
}
