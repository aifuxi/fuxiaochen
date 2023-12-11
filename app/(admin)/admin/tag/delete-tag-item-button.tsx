'use client';

import React from 'react';

import { type Tag } from '@prisma/client';
import { TrashIcon } from 'lucide-react';

import { deleteTag } from '@/app/actions/tag';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

type Props = {
  tag: Tag;
};

export function DeleteTagItemButton({ tag }: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size={'icon'}>
          <TrashIcon size={16} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTrigger>
          <AlertDialogTitle>删除标签</AlertDialogTitle>
          <AlertDialogDescription>确定要删除该标签吗？</AlertDialogDescription>
        </AlertDialogTrigger>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              await deleteTag(tag.id);
            }}
          >
            删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
