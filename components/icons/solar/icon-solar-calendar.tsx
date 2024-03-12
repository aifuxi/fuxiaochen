import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarCalendarMark = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--calendar-mark-bold]', className)}
    ></span>
  );
};
