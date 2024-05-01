import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarRocketLinear = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--rocket-linear]', className)}
    ></span>
  );
};
