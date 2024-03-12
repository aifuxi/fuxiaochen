import React from 'react';

import { cn } from '@/lib/utils';

export const IconSolarDocumentText = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('icon-[solar--document-text-bold]', className)}
    ></span>
  );
};
