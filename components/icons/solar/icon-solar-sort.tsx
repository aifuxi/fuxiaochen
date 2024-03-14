import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarSortFromBottomToTopLinear = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--sort-from-bottom-to-top-linear]', className)}
    ></span>
  );
};
export const IconSolarSortFromTopToBottomLinear = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--sort-from-top-to-bottom-linear]', className)}
    ></span>
  );
};
