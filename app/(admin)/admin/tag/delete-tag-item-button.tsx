'use client';

import React from 'react';

import { type Tag } from '@prisma/client';
import { TrashIcon } from '@radix-ui/react-icons';
import { AlertDialog, Button, IconButton } from '@radix-ui/themes';

import { deleteTag } from '@/app/_actions/tag';

type Props = {
  tag: Tag;
};

export function DeleteTagItemButton({ tag }: Props) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <IconButton color="red">
          <TrashIcon />
        </IconButton>
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Title>删除标签</AlertDialog.Title>
        <AlertDialog.Description>确定要删除该标签吗？</AlertDialog.Description>

        <div className="flex gap-3 mt-4 justify-end">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray">
              取消
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button
              variant="solid"
              color="red"
              onClick={async () => {
                await deleteTag(tag.id);
              }}
            >
              删除
            </Button>
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
