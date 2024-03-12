import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarUploadSquare = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--upload-square-bold]', className)}
    ></span>
  );
};
