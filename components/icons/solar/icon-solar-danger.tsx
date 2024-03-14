import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarDangerCircle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--danger-circle-bold]', className)}
    ></span>
  );
};

export const IconSolarDangerTriangle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--danger-triangle-bold]', className)}
    ></span>
  );
};
