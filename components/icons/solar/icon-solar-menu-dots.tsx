import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarMenuDots = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--menu-dots-bold]', className)}
    ></span>
  );
};
