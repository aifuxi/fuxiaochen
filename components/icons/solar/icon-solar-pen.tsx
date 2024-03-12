import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarPen = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span {...props} className={cn('icon-[solar--pen-bold]', className)}></span>
  );
};
