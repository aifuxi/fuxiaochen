import * as React from 'react';

import { cn } from '@/utils/helper';

import { IllustrationNotFoundDark } from './illustration-not-found-dark';
import { IllustrationNotFoundLight } from './illustration-not-found-light';

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
