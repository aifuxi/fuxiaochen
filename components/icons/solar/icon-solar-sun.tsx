import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarSun = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span {...props} className={cn('icon-[solar--sun-bold]', className)}></span>
  );
};
