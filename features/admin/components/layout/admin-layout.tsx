import React from 'react';

import { redirect } from 'next/navigation';

import { SwitchTheme } from '@/components/switch-theme';

import { PATHS } from '@/constants';
import { auth } from '@/lib/auth';

import { Sidenav } from '../sidenav';

export const AdminLayout = async ({ children }: React.PropsWithChildren) => {
  const session = await auth();

  if (!session?.user) {
    redirect(PATHS.NEXT_AUTH_SIGNIN);
  }

  return (
    <>
      <div className="flex bg-black dark:bg-white">
        <Sidenav />

        <section className="flex-1 bg-background rounded-tl-[2.5em] overflow-clip">
          {children}
        </section>
      </div>
      <div className="fixed w-12 h-12 grid place-content-center right-12 top-6">
        <SwitchTheme variant={'outline'} />
      </div>
    </>
  );
};
