import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarCheckSquare = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--check-square-bold]', className)}
    ></span>
  );
};
export const IconSolarCheckCircle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--check-circle-bold]', className)}
    ></span>
  );
};
