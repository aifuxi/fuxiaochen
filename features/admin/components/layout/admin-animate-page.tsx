import React from 'react';

import { cn } from '@/lib/utils';

type AdminAnimatePageProps = React.HTMLAttributes<HTMLDivElement>;

export const AdminAnimatePage = ({
  children,
  className,
  ...props
}: AdminAnimatePageProps) => {
  return (
    <div
      {...props}
      className={cn(className, 'animate-fade-left animate-ease-in-out')}
    >
      {children}
    </div>
  );
};
