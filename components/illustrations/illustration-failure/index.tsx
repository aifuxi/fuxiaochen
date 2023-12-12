import React from 'react';

import { cn } from '@/utils/helper';

import { IllustrationFailureDark } from './illustration-failure-dark';
import { IllustrationFailureLight } from './illustration-failure-light';

export function IllustrationFailure(props: React.SVGProps<SVGSVGElement>) {
  return (
    <>
      <IllustrationFailureDark
        {...props}
        className={cn(props.className, 'hidden dark:block')}
      />
      <IllustrationFailureLight
        {...props}
        className={cn(props.className, 'block dark:hidden')}
      />
    </>
  );
}
