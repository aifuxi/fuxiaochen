'use client';

import React from 'react';

import { SessionProvider } from 'next-auth/react';

import { SwitchTheme } from '@/components/switch-theme';

import { Sidenav } from '../sidenav';

export const AdminLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <SessionProvider>
      <div className="flex bg-black dark:bg-white">
        <Sidenav />

        <section className="flex-1 bg-background lg:rounded-tl-[2.5em] overflow-clip">
          {children}
        </section>
      </div>
      <div className="fixed w-12 h-12 grid place-content-center right-12 top-6">
        <SwitchTheme variant={'outline'} />
      </div>
    </SessionProvider>
  );
};
