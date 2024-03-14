import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarTuningSquare2 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--tuning-square-2-bold]', className)}
    ></span>
  );
};
export const IconSolarTuning2Linear = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--tuning-2-linear]', className)}
    ></span>
  );
};
