import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CreateArticleRequest, Tag } from '@/types';
import { cn } from '@/utils';

type Props = {
  tag: Tag;
  createArticleReq: CreateArticleRequest;
  setCreateArticleReq: React.Dispatch<
    React.SetStateAction<CreateArticleRequest>
  >;
};

const TagCheckboxItem = ({
  tag,
  createArticleReq,
  setCreateArticleReq,
}: Props) => {
  return (
    <Label
      htmlFor={`${tag.id}`}
      className="inline-flex items-center cursor-pointer"
    >
      <Badge
        variant={
          createArticleReq?.tags?.includes(tag.id) ? 'default' : 'outline'
        }
        className={cn('cursor-pointer p-2')}
      >
        <span>{tag.name}</span>
        <Checkbox
          id={`${tag.id}`}
          className="ml-2"
          checked={createArticleReq?.tags?.includes(tag.id)}
          onCheckedChange={(checked) => {
            const tagSet = new Set(createArticleReq.tags);
            if (checked && !tagSet.has(tag.id)) {
              tagSet.add(tag.id);
            } else {
              tagSet.delete(tag.id);
            }

            setCreateArticleReq({
              ...createArticleReq,
              tags: [...tagSet],
            });
          }}
        />
      </Badge>
    </Label>
  );
};

export default TagCheckboxItem;
