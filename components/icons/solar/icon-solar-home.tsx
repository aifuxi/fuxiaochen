import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarHomeSmile = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--home-smile-bold]', className)}
    ></span>
  );
};
