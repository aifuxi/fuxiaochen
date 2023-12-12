import React from 'react';

import { IllustrationNoAccessDark } from './illustration-no-access-dark';
import { IllustrationNoAccessLight } from './illustration-no-access-light';
import { cn } from '@/utils/helper';

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
