import React from 'react';

import { IllustrationNotFoundDark } from './illustration-not-found-dark';
import { IllustrationNotFoundLight } from './illustration-not-found-light';
import { cn } from '@/utils';

export function IllustrationNotFound(props: React.SVGProps<SVGSVGElement>) {
  return (
    <>
      <IllustrationNotFoundDark
        {...props}
        className={cn(props.className, 'hidden dark:block')}
      />
      <IllustrationNotFoundLight
        {...props}
        className={cn(props.className, 'block dark:hidden')}
      />
    </>
  );
}
