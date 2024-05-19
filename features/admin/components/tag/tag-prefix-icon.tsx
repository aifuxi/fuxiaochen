import React from 'react';

import { type Tag } from '@/features/tag';
import { cn } from '@/lib/utils';

type TagPrefixIconProps = {
  tag: Pick<Tag, 'icon' | 'iconDark'>;
  className?: string;
};

export const TagPrefixIcon = ({ tag, className }: TagPrefixIconProps) => {
  return (
    <>
      {tag.icon && (
        <img
          src={tag.icon}
          className={cn('w-4 h-4 mr-1 hidden dark:inline-flex', className)}
          alt=""
        />
      )}
      {tag.iconDark && (
        <img
          src={tag.iconDark}
          className={cn('w-4 h-4 mr-1 dark:hidden', className)}
          alt=""
        />
      )}
    </>
  );
};
