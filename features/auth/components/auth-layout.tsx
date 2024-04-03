import React from 'react';

import { SwitchTheme } from '@/components/switch-theme';

export const AuthLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <>
      {children}
      <div className="fixed w-12 h-12 grid place-content-center right-12 top-6">
        <SwitchTheme variant={'outline'} />
      </div>
    </>
  );
};
