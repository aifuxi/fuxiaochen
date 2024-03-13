import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarSquareAltArrowDown = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--square-alt-arrow-down-bold]', className)}
    ></span>
  );
};

export const IconSolarSquareAltArrowUp = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--square-alt-arrow-up-bold]', className)}
    ></span>
  );
};

export const IconSolarAltArrowDownLinear = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--alt-arrow-down-linear]', className)}
    ></span>
  );
};
export const IconSolarAltArrowRightLinear = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--alt-arrow-right-linear]', className)}
    ></span>
  );
};
