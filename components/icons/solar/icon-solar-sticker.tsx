import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarStickerCircleLinear = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--sticker-circle-linear]', className)}
    ></span>
  );
};
