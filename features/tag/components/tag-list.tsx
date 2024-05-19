import React from 'react';

import { buttonVariants } from '@/components/ui/button';

import { cn } from '@/lib/utils';

import { TagPrefixIcon } from './tag-prefix-icon';

import { type Tag } from '../types';

type TagListProps = {
  tags?: Pick<Tag, 'id' | 'name' | 'icon' | 'iconDark'>[];
};

export const TagList = ({ tags }: TagListProps) => {
  return (
    <ul className="flex gap-x-2 gap-y-2 flex-wrap">
      {tags?.map((el) => (
        <li
          key={el.id}
          className={cn(
            'cursor-pointer',
            buttonVariants({
              variant: 'outline',
            }),
          )}
        >
          <TagPrefixIcon tag={el} />
          <span>{el.name}</span>
        </li>
      ))}
    </ul>
  );
};
