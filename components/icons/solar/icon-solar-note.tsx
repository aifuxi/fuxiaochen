import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarNotesBold = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--notes-bold]', className)}
    ></span>
  );
};
