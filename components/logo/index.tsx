import React from 'react';

import { ImageAssets, WEBSITE } from '@/constants';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

export const Logo = ({ className }: Props) => {
  return (
    <>
      <img
        src={ImageAssets.logoLight}
        className={cn('w-8 h-8 hidden dark:block', className)}
        alt={WEBSITE}
      />
      <img
        src={ImageAssets.logoDark}
        className={cn('w-8 h-8 dark:hidden', className)}
        alt={WEBSITE}
      />
    </>
  );
};
