import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarMinimalisticMagnifer = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--minimalistic-magnifer-bold]', className)}
    ></span>
  );
};
