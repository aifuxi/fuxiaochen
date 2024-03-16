import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarEyeBold = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span {...props} className={cn('icon-[solar--eye-bold]', className)}></span>
  );
};
