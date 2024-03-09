import * as React from 'react';

import { cn } from '@/lib/utils';

import { IllustrationNoAccessDark } from './illustration-no-access-dark';
import { IllustrationNoAccessLight } from './illustration-no-access-light';

export function IllustrationNoAccess(props: React.SVGProps<SVGSVGElement>) {
  return (
    <>
      <IllustrationNoAccessDark
        {...props}
        className={cn(props.className, 'hidden dark:block')}
      />
      <IllustrationNoAccessLight
        {...props}
        className={cn(props.className, 'block dark:hidden')}
      />
    </>
  );
}
