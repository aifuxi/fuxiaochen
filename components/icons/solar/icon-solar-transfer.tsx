import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarTransferVerticalLinear = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--transfer-vertical-linear]', className)}
    ></span>
  );
};
