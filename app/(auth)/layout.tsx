import { redirect } from 'next/navigation';

import { SwitchTheme } from '@/components/switch-theme';

import { auth } from '@/libs/auth';

import { PATHS } from '@/constants/path';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.email ?? session?.user?.name) {
    redirect(PATHS.ADMIN_HOME);
  }
  return (
    <>
      {children}
      <div className="fixed w-12 h-12 grid place-content-center right-12 top-6">
        <SwitchTheme variant={'outline'} />
      </div>
    </>
  );
}
