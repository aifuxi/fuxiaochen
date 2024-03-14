import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarInfoCircle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--info-circle-bold]', className)}
    ></span>
  );
};
