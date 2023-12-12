import React from 'react';

import { IllustrationIdleDark } from './illustration-idle-dark';
import { IllustrationIdleLight } from './illustration-idle-light';
import { cn } from '@/utils/helper';

export function IllustrationIdle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <>
      <IllustrationIdleDark
        {...props}
        className={cn(props.className, 'hidden dark:block')}
      />
      <IllustrationIdleLight
        {...props}
        className={cn(props.className, 'block dark:hidden')}
      />
    </>
  );
}
