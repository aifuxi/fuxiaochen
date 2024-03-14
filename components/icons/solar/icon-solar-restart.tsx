import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarRestartSquare = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--restart-square-bold]', className)}
    ></span>
  );
};

export const IconSolarRestart = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--restart-bold]', className)}
    ></span>
  );
};

export const IconSolarRestartLinear = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--restart-linear]', className)}
    ></span>
  );
};
