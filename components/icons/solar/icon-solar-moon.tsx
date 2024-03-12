import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarMoonStars = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--moon-stars-bold]', className)}
    ></span>
  );
};
