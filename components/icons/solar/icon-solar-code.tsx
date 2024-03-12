import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarCodeSquare = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--code-square-bold]', className)}
    ></span>
  );
};
