import { type Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PATHS } from '@/constants/path';
import { auth } from '@/libs/auth';

export const metadata: Metadata = {
  title: '用户登录',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user.email) {
    redirect(PATHS.ADMIN_HOME);
  }
  return <>{children}</>;
}
