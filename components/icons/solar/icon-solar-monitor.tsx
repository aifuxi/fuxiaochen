import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarMonitorBold = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--monitor-bold]', className)}
    ></span>
  );
};
