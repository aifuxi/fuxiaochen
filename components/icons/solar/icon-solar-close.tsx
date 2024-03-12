import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarCloseSquare = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--close-square-bold]', className)}
    ></span>
  );
};

export const IconSolarCloseCircle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--close-circle-bold]', className)}
    ></span>
  );
};
