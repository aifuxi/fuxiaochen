import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarAddSquare = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--add-square-bold]', className)}
    ></span>
  );
};
