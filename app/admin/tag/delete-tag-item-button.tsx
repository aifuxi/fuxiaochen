'use client';

import React from 'react';

import { IconButton } from '@radix-ui/themes';
import { Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ZERO } from '@/constants';
import { deleteTag } from '@/services';
import type { Tag } from '@/types';

type Props = {
  tag: Tag;
};

const DeleteTagItemButton: React.FC<Props> = ({ tag }) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <IconButton className="bg-red-9" color="red">
          <Trash2 size={16} />
        </IconButton>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确定要删除该标签吗？</AlertDialogTitle>
          <AlertDialogDescription className="text-destructive">
            该操作不可逆，数据将直接从数据库删除
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              deleteTag(tag.id).then((res) => {
                if (res.code !== ZERO) {
                } else {
                }
              });
            }}
          >
            删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTagItemButton;
