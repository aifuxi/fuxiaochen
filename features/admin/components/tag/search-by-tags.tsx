import React from 'react';

import { type SetState } from 'ahooks/lib/useSetState';

import { buttonVariants } from '@/components/ui/button';

import { type Tag, TagPrefixIcon } from '@/features/tag';
import { cn } from '@/lib/utils';

type SearchByTagsProps = {
  tags?: Pick<Tag, 'id' | 'name' | 'icon' | 'iconDark'>[];
  params: { tags?: string[] };
  updateParams: SetState<{ tags: string[] }>;
};

export const SearchByTags = ({
  tags,
  params,
  updateParams,
}: SearchByTagsProps) => {
  return (
    <ul className="flex gap-x-2 gap-y-2 flex-wrap">
      {tags?.map((el) => (
        <li
          key={el.id}
          className={cn(
            'cursor-pointer',
            buttonVariants({
              variant: params.tags?.includes(el.id) ? 'default' : 'outline',
            }),
          )}
          onClick={() => {
            updateParams((draft) => {
              const s = new Set(draft.tags);
              if (s.has(el.id)) {
                s.delete(el.id);
              } else {
                s.add(el.id);
              }

              return { tags: [...s] };
            });
          }}
        >
          <TagPrefixIcon tag={el} />
          <span>{el.name}</span>
        </li>
      ))}
    </ul>
  );
};
