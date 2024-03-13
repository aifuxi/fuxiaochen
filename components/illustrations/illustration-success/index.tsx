import React from 'react';

import { cn } from '@/lib/utils';

import { IllustrationSuccessDark } from './illustration-success-dark';
import { IllustrationSuccessLight } from './illustration-success-light';

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
