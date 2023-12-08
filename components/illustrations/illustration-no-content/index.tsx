import React from 'react';

import { IllustrationNoContentDark } from './illustration-no-content-dark';
import { IllustrationNoContentLight } from './illustration-no-content-light';
import { cn } from '@/utils';

export function IllustrationNoContent(props: React.SVGProps<SVGSVGElement>) {
  return (
    <>
      <IllustrationNoContentDark
        {...props}
        className={cn(props.className, 'hidden dark:block')}
      />
      <IllustrationNoContentLight
        {...props}
        className={cn(props.className, 'block dark:hidden')}
      />
    </>
  );
}
