import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarSettingsLinear = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--settings-linear]', className)}
    ></span>
  );
};
