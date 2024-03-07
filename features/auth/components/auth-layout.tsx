import { redirect } from 'next/navigation';

import { PATHS } from '@/config';

import { type FCProps } from '@/types';

import { SwitchTheme } from '@/components/switch-theme';

import { auth } from '@/lib/auth';

export const AuthLayout = async ({ children }: FCProps) => {
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
};
