import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarLogout2 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--logout-2-bold]', className)}
    ></span>
  );
};
