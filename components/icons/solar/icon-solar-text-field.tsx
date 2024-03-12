import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarTextField = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--text-field-bold]', className)}
    ></span>
  );
};
