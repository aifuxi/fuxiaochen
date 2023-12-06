'use client';

import { type Tag } from '@prisma/client';
import { Text, TextField } from '@radix-ui/themes';
import { PencilIcon } from 'lucide-react';

import { updateTag } from '@/app/_actions/tag';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type Props = {
  tag: Tag;
};

export function EditTagButton({ tag }: Props) {
  return (
    <Dialog>
      <DialogTrigger>
        <Button size={'icon'}>
          <PencilIcon size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑标签</DialogTitle>
        </DialogHeader>
        <form action={updateTag}>
          <div className="flex flex-col gap-3">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                名称
              </Text>
              <TextField.Input
                defaultValue={tag.name}
                placeholder="请输入标签名称"
                name="name"
                autoComplete="off"
              />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                链接
              </Text>
              <TextField.Input
                defaultValue={tag.friendlyUrl}
                placeholder="请输入标签链接"
                name="friendlyUrl"
                autoComplete="off"
              />
            </label>
            <input type="hidden" name="id" value={tag.id} />
          </div>
          <DialogFooter>
            <Button>保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditTagButton;
