import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarShieldNetwork = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--shield-network-bold]', className)}
    ></span>
  );
};
