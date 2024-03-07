import { redirect } from 'next/navigation';

import { SwitchTheme } from '@/components/switch-theme';

import { PATHS } from '@/constants/path';

import { auth } from '@/lib/auth';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.user) {
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
