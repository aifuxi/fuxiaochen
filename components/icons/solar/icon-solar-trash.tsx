import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarTrashBinMinimalistic2 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--trash-bin-minimalistic-2-bold]', className)}
    ></span>
  );
};
