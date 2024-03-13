import React from 'react';

import { redirect } from 'next/navigation';

import { PATHS } from '@/config';


import { SwitchTheme } from '@/components/switch-theme';

import { auth } from '@/lib/auth';

import { Sidenav } from '../sidenav';

export const AdminLayout = async ({ children }: React.PropsWithChildren) => {
  const session = await auth();

  if (!session?.user) {
    redirect(PATHS.AUTH_SIGNIN);
  }

  return (
    <>
      <div className="flex">
        <Sidenav />

        <section className="max-h-screen overflow-y-auto flex flex-1 p-8 flex-col">
          {children}
        </section>
      </div>
      <div className="fixed w-12 h-12 grid place-content-center right-12 top-6">
        <SwitchTheme variant={'outline'} />
      </div>
    </>
  );
};
