import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarChartSquare = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--chart-square-bold]', className)}
    ></span>
  );
};
