import React from 'react';

import { IllustrationSuccessDark } from './illustration-success-dark';
import { IllustrationSuccessLight } from './illustration-success-light';
import { cn } from '@/utils';

export function IllustrationSuccess(props: React.SVGProps<SVGSVGElement>) {
  return (
    <>
      <IllustrationSuccessDark
        {...props}
        className={cn(props.className, 'hidden dark:block')}
      />
      <IllustrationSuccessLight
        {...props}
        className={cn(props.className, 'block dark:hidden')}
      />
    </>
  );
}
