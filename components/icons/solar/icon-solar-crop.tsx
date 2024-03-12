import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarCropMinimalistic = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--crop-minimalistic-bold]', className)}
    ></span>
  );
};
