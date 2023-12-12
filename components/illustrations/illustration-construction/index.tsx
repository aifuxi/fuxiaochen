import React from 'react';

import { IllustrationConstructionDark } from './illustration-construction-dark';
import { IllustrationConstructionLight } from './illustration-construction-light';
import { cn } from '@/utils/helper';

export function IllustrationConstruction(props: React.SVGProps<SVGSVGElement>) {
  return (
    <>
      <IllustrationConstructionDark
        {...props}
        className={cn(props.className, 'hidden dark:block')}
      />
      <IllustrationConstructionLight
        {...props}
        className={cn(props.className, 'block dark:hidden')}
      />
    </>
  );
}
