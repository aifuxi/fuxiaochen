import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarTag = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span {...props} className={cn('icon-[solar--tag-bold]', className)}></span>
  );
};
