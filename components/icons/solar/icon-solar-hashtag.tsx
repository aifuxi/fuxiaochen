import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarHashtagSquare = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--hashtag-square-bold]', className)}
    ></span>
  );
};
