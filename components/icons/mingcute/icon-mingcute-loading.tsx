import React from 'react';

import { cn } from '@/lib/utils';

export const IconMingcuteLoadingLine = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[mingcute--loading-line]', className)}
    ></span>
  );
};
