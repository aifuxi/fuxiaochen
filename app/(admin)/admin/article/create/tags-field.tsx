'use client';

import { type Tag } from '@prisma/client';
import { Badge } from '@radix-ui/themes';
import { enableMapSet } from 'immer';
import { useImmer } from 'use-immer';

import { CreateTagButton } from '../../tag/create-tag-button';

enableMapSet();

type Props = {
  tags?: Tag[];
  initialTags?: Tag[];
  name: string;
};

export function TagsField({ tags, name, initialTags }: Props) {
  const [tagIDs, setTagIDs] = useImmer(
    new Set<string>(initialTags?.map((el) => el.id)),
  );

  return (
    <div className="flex flex-wrap gap-2">
      {tags?.map((v) => {
        return (
          <div key={v.id} className="flex gap-2">
            <label>
              <Badge
                variant={tagIDs.has(v.id) ? 'solid' : 'soft'}
                color="gray"
                highContrast
                size={'2'}
              >
                {/* <Checkbox name={name} checked={tagIDs.has(v.id)} /> */}
                <input
                  type="checkbox"
                  name={name}
                  checked={tagIDs.has(v.id)}
                  onChange={(e) => {
                    const value = e.target.checked;
                    setTagIDs((draft) => {
                      value ? draft.add(v.id) : draft.delete(v.id);
                    });
                  }}
                  value={v.id}
                />
                {v.name}
              </Badge>
            </label>
          </div>
        );
      })}

      <CreateTagButton />
    </div>
  );
}
